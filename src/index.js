import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import { createClient } from 'webdav';

import indexHtml from '../public/index.html';
// epub.min.js 将作为静态资源提供服务，而不是导入。

const app = new Hono();

// --- 静态资源服务 ---
app.get('/', (c) => {
    return c.html(indexHtml);
});

// epub.min.js 将通过此路由提供服务，使用构建时注入的内容。
app.get('/epub.min.js', (c) => {
    // 注意：EPUB_JS_CONTENT 由 build.js 注入
    if (typeof EPUB_JS_CONTENT === 'undefined') {
        console.error("EPUB_JS_CONTENT 未定义。构建步骤可能失败或配置错误。");
        return c.text('// 错误：未找到 epub.min.js 内容。', 500, {'Content-Type': 'application/javascript'});
    }
    return c.text(EPUB_JS_CONTENT, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'max-age=3600' // 缓存 1 小时
        }
    });
});



// --- 中间件 ---
const authMiddleware = async (c, next) => {
    const token = getCookie(c, 'auth_token');
    if (!token) {
        if (c.req.path.startsWith('/api')) {
            return c.json({ error: '未授权' }, 401);
        }
        return new Response('未授权', { status: 401 });
    }
    try {
        const decodedPayload = await verify(token, c.env.JWT_SECRET);
        c.set('jwtPayload', decodedPayload);
        await next();
    } catch (e) {
        console.error("认证中间件错误:", e);
        c.header('Set-Cookie', 'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
        if (c.req.path.startsWith('/api')) {
            return c.json({ error: '令牌无效或已过期' }, 401);
        }
        return new Response('令牌无效或已过期', { status: 401 });
    }
};


const adminMiddleware = async (c, next) => {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.isAdmin) {
        return c.json({ error: '禁止访问：仅限管理员' }, 403);
    }
    await next();
};

// --- 获取 WebDAV 客户端的辅助函数 ---
async function getWebDAVClient(c) {
    try {
        const config = await c.env.DB.prepare('SELECT url, username, password FROM webdav_config WHERE id = 1').first();
        if (!config || !config.url || !config.username || !config.password) {
            console.warn("数据库中缺少 WebDAV 配置");
            return null;
        }
        // *** 确保基础 URL 不以 / 结尾，库通常会处理拼接 ***
        const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
        return createClient(baseUrl, {
            username: config.username,
            password: config.password,
        });
    } catch (dbError) {
        console.error("从数据库获取 WebDAV 配置时出错:", dbError);
        return null;
    }
}

// --- Auth 端点 ---
app.post('/api/register', async (c) => {
    try {
        const { username, password } = await c.req.json();
        if (!username || !password) {
            return c.json({ error: '用户名和密码是必需的' }, 400);
        }
        if (password.length < 6) {
             return c.json({ error: '密码必须至少为 6 个字符' }, 400);
        }

        const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (existingUser) {
            return c.json({ error: '用户名已被占用' }, 409);
        }

        const userCountResult = await c.env.DB.prepare('SELECT COUNT(id) as count FROM users').first();
        const isFirstUser = userCountResult.count === 0;
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        await c.env.DB.prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)').bind(username, passwordHash, isFirstUser ? 1 : 0).run();
        return c.json({ message: '用户注册成功' }, 201);

    } catch (e) {
        console.error("注册错误:", e);
        return c.json({ error: '注册失败', details: e.message }, 500);
    }
});

app.post('/api/login', async (c) => {
     try {
        const { username, password } = await c.req.json();
        if (!username || !password) {
            return c.json({ error: '用户名和密码是必需的' }, 400);
        }

        const user = await c.env.DB.prepare('SELECT id, password_hash, is_admin FROM users WHERE username = ?').bind(username).first();
        if (!user) {
            return c.json({ error: '凭证无效' }, 401);
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            return c.json({ error: '凭证无效' }, 401);
        }

        const expiry = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7); // 7 天
        const payload = {
            sub: user.id,
            isAdmin: user.is_admin === 1,
            exp: expiry
        };
        const token = await sign(payload, c.env.JWT_SECRET);

        c.header('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`);
        return c.json({ message: '登录成功', isAdmin: user.is_admin === 1 });

    } catch (e) {
        console.error("登录错误:", e);
        return c.json({ error: '登录失败', details: e.message }, 500);
    }
});

// --- Admin API ---
const adminApi = new Hono();
adminApi.use('*', authMiddleware, adminMiddleware);

adminApi.get('/webdav', async (c) => {
    try {
        const config = await c.env.DB.prepare('SELECT url, username FROM webdav_config WHERE id = 1').first();
        return c.json(config || { url: '', username: '' });
    } catch (e) {
        console.error("获取 WebDAV 配置错误:", e);
        return c.json({ error: '无法检索 WebDAV 配置' }, 500);
    }
});

adminApi.post('/webdav', async (c) => {
    try {
        const { url, username, password } = await c.req.json();
        if (!url || !username || !password || !url.startsWith('http')) {
            return c.json({ error: '需要有效的 URL（以 http/https 开头）、用户名和密码' }, 400);
        }

        try {
             // *** 确保基础 URL 不以 / 结尾 ***
            const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
            const testClient = createClient(baseUrl, { username, password });
            await testClient.getDirectoryContents('/'); // 尝试根目录，或者一个你知道存在的目录
            console.log("WebDAV 连接测试成功。");
        } catch (webdavError) {
             console.error("WebDAV 连接测试失败:", webdavError);
             if (webdavError.response && webdavError.response.status === 401) {
                 return c.json({ error: 'WebDAV 认证失败。请检查用户名/密码。' }, 401);
             } else if (webdavError.message.includes('ECONNREFUSED') || webdavError.message.includes('ENOTFOUND')) {
                  return c.json({ error: 'WebDAV 连接失败。请检查 URL 或网络。' }, 400);
             }
             return c.json({ error: '无法连接到 WebDAV 服务器。', details: webdavError.message || '未知连接错误' }, 500);
        }

        await c.env.DB.prepare(
            'INSERT INTO webdav_config (id, url, username, password) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET url=excluded.url, username=excluded.username, password=excluded.password'
        ).bind(url, username, password).run(); // 存储原始 URL
        return c.json({ message: 'WebDAV 配置已成功保存。' });
    } catch (e) {
        console.error("保存 WebDAV 配置错误:", e);
        return c.json({ error: '无法保存 WebDAV 配置', details: e.message }, 500);
    }
});
app.route('/api/admin', adminApi);

// --- Book API ---
const bookApi = new Hono();
bookApi.use('*', authMiddleware);

// 获取 EPUB 书籍列表
bookApi.get('/books', async (c) => {
    const { q } = c.req.query();
    const client = await getWebDAVClient(c);
    if (!client) {
        return c.json({ error: 'WebDAV 服务尚未由管理员配置。' }, 503);
    }
    try {
        // *** 尝试获取根目录内容 ***
        const directoryItems = await client.getDirectoryContents('/');
        let epubFiles = directoryItems
            .filter(item => item.type === 'file' && item.filename.toLowerCase().endsWith('.epub'));

        if (q) {
            const searchTerm = q.toLowerCase();
            epubFiles = epubFiles.filter(item => item.basename.toLowerCase().includes(searchTerm));
        }

        // 映射时，确保存储的 path 是相对于 WebDAV 根目录的路径
        const mappedFiles = epubFiles.map(item => ({
                name: item.basename,
                path: item.filename, // filename 应该是相对于 client base URL 的路径
            }));
        return c.json(mappedFiles);
    } catch (e) {
        console.error("WebDAV 列出书籍错误:", e);
         if (e.response && e.response.status === 401) {
             return c.json({ error: 'WebDAV 认证失败。请联系管理员。' }, 500);
         }
        return c.json({ error: '无法从 WebDAV 获取书籍。', details: e.message }, 500);
    }
});

// 上传书籍
bookApi.post('/upload', async (c) => {
    const client = await getWebDAVClient(c);
    if (!client) {
        return c.json({ error: 'WebDAV 服务尚未由管理员配置。' }, 503);
    }

    try {
        const formData = await c.req.formData();
        const file = formData.get('book');

        if (!file || !(file instanceof File)) {
            return c.json({ error: '未上传文件或格式无效。' }, 400);
        }
        if (!file.name.toLowerCase().endsWith('.epub')) {
            return c.json({ error: '无效的文件类型。只允许上传 .epub 文件。' }, 400);
        }

        // *** 使用 DECODED 文件名（不带前导斜杠）传递给库 ***
        const bookPath = file.name; // 假设上传到配置的基础 URL 下

        // 检查文件是否已存在
        const exists = await client.exists(bookPath);
        if (exists) {
            return c.json({ error: '已存在同名书籍。' }, 409);
        }

        const fileBuffer = await file.arrayBuffer();
        const contentToUpload = typeof Buffer !== 'undefined' ? Buffer.from(fileBuffer) : fileBuffer;
        const success = await client.putFileContents(bookPath, contentToUpload);

        if (success) {
             // 返回给前端的路径需要带上前导 /，因为它在前端被视为相对于根的路径
            return c.json({ message: '书籍上传成功！', path: `/${file.name}` });
        } else {
            return c.json({ error: '无法在 WebDAV 服务器上保存书籍。' }, 500);
        }
    } catch (e) {
        console.error("WebDAV 上传书籍错误:", e);
        if (e.response && e.response.status === 401) {
             return c.json({ error: 'WebDAV 认证失败。请联系管理员。' }, 500);
        }
        return c.json({ error: '无法将书籍上传到 WebDAV。', details: e.message || '未知上传错误' }, 500);
    }
});


// *** 获取特定书籍的内容 (传递解码后且无前导斜杠的路径) ***
bookApi.get('/book/*', async (c) => {
    const client = await getWebDAVClient(c);
    if (!client) {
        return c.json({ error: 'WebDAV 服务尚未由管理员配置。' }, 503);
    }

    let rawPathSegment = '';
    const pathPrefix = '/api/book';

    try {
        const url = new URL(c.req.url);
        const fullPath = url.pathname;
        const prefixIndex = fullPath.indexOf(pathPrefix);
        if (prefixIndex === -1) throw new Error(`路径前缀 "${pathPrefix}" 未找到`);
        const encodedPart = fullPath.substring(prefixIndex + pathPrefix.length);
        // *** 关键修复：解码路径段以获得原始文件名 ***
        // 我们在这里解码，因为 webdav 库可能期望一个解码后的路径，并由它自己处理编码。
        // 这解决了当路径包含需要编码的字符（如中文字符）时的问题。
        rawPathSegment = decodeURIComponent(encodedPart);
        if (rawPathSegment === '') throw new Error('提取的书籍路径为空');
    } catch (e) {
        console.error("解析书籍路径参数时出错:", c.req.url, e);
        return c.json({ error: '书籍路径无效。', details: e.message }, 400);
    }

    // *** 关键：移除前导斜杠 ***
    const bookPathForRequest = rawPathSegment.startsWith('/') ? rawPathSegment.substring(1) : rawPathSegment;

    // 为了日志和数据库的可读性，我们在这里解码一次来获取人类可读的标识符
    const bookIdentifierForClient = decodeURIComponent(rawPathSegment.startsWith('/') ? rawPathSegment : '/' + rawPathSegment);

    console.log(`传递给 WebDAV 库的原始编码路径: '${bookPathForRequest}'`);
    console.log(`用于客户端/数据库的人类可读路径: '${bookIdentifierForClient}'`);

    try {
        // *** 传递从 URL 获取的原始编码路径 ***
        const fileContents = await client.getFileContents(bookPathForRequest, { format: "binary" });

        if (!fileContents || (fileContents.byteLength !== undefined && fileContents.byteLength === 0)) {
            console.error("WebDAV 错误：getFileContents 返回空内容对于", bookPathForRequest);
            return c.json({ error: '书籍内容为空或无法检索。', path: bookIdentifierForClient }, 500);
        }

        const response = new Response(fileContents, {
            headers: {
                'Content-Type': 'application/epub+zip',
                ...(fileContents.byteLength !== undefined && {'Content-Length': fileContents.byteLength.toString()})
             }
        });
       return response;

    } catch (e) {
        console.error(`WebDAV 获取书籍内容错误: 请求路径='${bookPathForRequest}' (原始标识: '${bookIdentifierForClient}')`, e);

        const status = e.response?.status;
        const responseText = await e.response?.text?.().catch(() => null);

        if (status === 404) {
             // 明确告知用户哪个路径未找到
             return c.json({ error: `在 WebDAV 服务器上找不到书籍: ${bookIdentifierForClient}`, path: bookIdentifierForClient }, 404);
        }
        if (status === 401) {
             return c.json({ error: 'WebDAV 认证失败。请联系管理员。', path: bookIdentifierForClient }, 401);
        }
         if (status === 400) {
             console.error("WebDAV 返回 400 Bad Request。响应体:", responseText);
             return c.json({ error: 'WebDAV 服务器返回 Bad Request。可能是库处理路径的方式与服务器不兼容。', path: bookIdentifierForClient, details: responseText || e.message }, 400);
        }
        return c.json({ error: '无法从 WebDAV 获取书籍内容。', path: bookIdentifierForClient, details: responseText || e.message || '未知错误' }, 500);
    }
});


// --- 阅读进度 API ---
bookApi.get('/progress/*', async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    let bookIdentifier = ''; // 存储在 DB 中的是带 / 的路径
    const pathPrefix = '/api/progress';
    try {
        const url = new URL(c.req.url);
        const fullPath = url.pathname;
        const prefixIndex = fullPath.indexOf(pathPrefix);
        if (prefixIndex === -1) throw new Error(`路径前缀 "${pathPrefix}" 未找到`);
        const encodedPart = fullPath.substring(prefixIndex + pathPrefix.length);
        bookIdentifier = decodeURIComponent(encodedPart);
        if (bookIdentifier === '') throw new Error('提取的书籍标识符为空');
       // *** 确保数据库标识符以 / 开头 ***
       if (!bookIdentifier.startsWith('/')) bookIdentifier = '/' + bookIdentifier;
    } catch (e) {
       console.error("处理进度路径错误:", c.req.path, e);
       return c.json({ error: '书籍标识符编码或格式无效' }, 400);
    }

    // bookIdentifier 现在是 '/' 开头的解码路径
    if (!bookIdentifier || bookIdentifier === '/') {
        return c.json({ error: '无效的书籍标识符' }, 400);
    }


    try {
        const progress = await c.env.DB.prepare(
            'SELECT cfi FROM reading_progress WHERE user_id = ? AND book_identifier = ?'
        ).bind(userId, bookIdentifier).first();
        return c.json({ cfi: progress?.cfi ?? null });
    } catch (e) {
        console.error("获取进度错误:", e);
        return c.json({ error: '无法获取阅读进度' }, 500);
    }
});

bookApi.post('/progress', async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const { book_identifier, cfi } = await c.req.json(); // book_identifier 应是带 / 的解码路径

    if (!book_identifier || typeof book_identifier !== 'string' || !book_identifier.startsWith('/')) {
         return c.json({ error: '无效的书籍标识符格式（必须是以 / 开头的字符串）' }, 400);
    }
    if (typeof cfi !== 'string') {
        return c.json({ error: 'cfi（字符串）是必需的' }, 400);
    }

    try {
        await c.env.DB.prepare(
            `INSERT INTO reading_progress (user_id, book_identifier, cfi, updated_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(user_id, book_identifier)
             DO UPDATE SET cfi=excluded.cfi, updated_at=CURRENT_TIMESTAMP`
        ).bind(userId, book_identifier, cfi).run();
        return c.json({ message: '进度已保存' });
    } catch (e) {
        console.error("保存进度错误:", e);
        return c.json({ error: '无法保存进度', details: e.message }, 500);
    }
});

// --- 书签 API ---
bookApi.get('/bookmarks/*', async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    let bookIdentifier = ''; // 存储在 DB 中的是带 / 的路径
    const pathPrefix = '/api/bookmarks';
     try {
        const url = new URL(c.req.url);
        const fullPath = url.pathname;
        const prefixIndex = fullPath.indexOf(pathPrefix);
        if (prefixIndex === -1) throw new Error(`路径前缀 "${pathPrefix}" 未找到`);
        const encodedPart = fullPath.substring(prefixIndex + pathPrefix.length);
        bookIdentifier = decodeURIComponent(encodedPart);
         if (bookIdentifier === '') throw new Error('提取的书籍标识符为空');
       // *** 确保数据库标识符以 / 开头 ***
       if (!bookIdentifier.startsWith('/')) bookIdentifier = '/' + bookIdentifier;
    } catch (e) {
       console.error("处理书签路径错误:", c.req.path, e);
       return c.json({ error: '书籍标识符编码或格式无效' }, 400);
    }

    // bookIdentifier 现在是 '/' 开头的解码路径
    if (!bookIdentifier || bookIdentifier === '/') {
        return c.json({ error: '无效的书籍标识符' }, 400);
    }


    try {
        const bookmarks = await c.env.DB.prepare(
            'SELECT id, cfi, label, created_at FROM bookmarks WHERE user_id = ? AND book_identifier = ? ORDER BY created_at DESC'
        ).bind(userId, bookIdentifier).all();
        return c.json(bookmarks?.results || []);
    } catch (e) {
        console.error("获取书签错误:", e);
        return c.json({ error: '无法检索书签' }, 500);
    }
});

bookApi.post('/bookmarks', async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const { book_identifier, cfi, label } = await c.req.json(); // book_identifier 应是带 / 的解码路径

    if (!book_identifier || typeof book_identifier !== 'string' || !book_identifier.startsWith('/')) {
         return c.json({ error: '无效的书籍标识符格式（必须是以 / 开头的字符串）' }, 400);
    }
     if (!cfi || typeof cfi !== 'string') {
        return c.json({ error: 'cfi（字符串）是必需的' }, 400);
    }

    const cleanLabel = (label && typeof label === 'string') ? label.substring(0, 100) : null;

    try {
        const existing = await c.env.DB.prepare(
            'SELECT id FROM bookmarks WHERE user_id = ? AND book_identifier = ? AND cfi = ?'
            ).bind(userId, book_identifier, cfi).first();
        if (existing) {
             return c.json({ error: '此位置的书签已存在' }, 409);
        }

        const result = await c.env.DB.prepare(
            'INSERT INTO bookmarks (user_id, book_identifier, cfi, label) VALUES (?, ?, ?, ?)'
        ).bind(userId, book_identifier, cfi, cleanLabel).run();

         if (result.success) {
            return c.json({ message: '书签已添加' }, 201);
         } else {
             throw new Error("无法将书签插入数据库。");
         }

    } catch (e) {
        if (e.message && e.message.toLowerCase().includes('unique constraint failed')) {
            return c.json({ error: '此位置的书签已存在' }, 409);
        }
        console.error("添加书签错误:", e);
        return c.json({ error: '无法添加书签', details: e.message }, 500);
    }
});

bookApi.delete('/bookmark/:id', async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const bookmarkId = c.req.param('id');

    if (!/^\d+$/.test(bookmarkId)) {
        return c.json({ error: '无效的书签 ID 格式' }, 400);
    }
    const bookmarkIdNum = Number(bookmarkId);

    try {
        const result = await c.env.DB.prepare(
            'DELETE FROM bookmarks WHERE id = ? AND user_id = ?'
        ).bind(bookmarkIdNum, userId).run();

        if (!result.success) {
             console.error("删除书签失败，结果:", result);
             return c.json({ error: '未找到书签或您无权删除它' }, 404);
        }
        return c.json({ message: '书签已成功删除' });

    } catch (e) {
        console.error("删除书签错误:", e);
        return c.json({ error: '无法删除书签', details: e.message }, 500);
    }
});


app.route('/api', bookApi);

// 兜底路由处理未匹配的 API 请求
app.all('/api/*', (c) => c.json({ error: '未找到' }, 404));


export default app;

