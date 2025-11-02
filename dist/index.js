var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// ../node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i2) {
      if (i2 <= index) {
        throw new Error("next() called multiple times");
      }
      index = i2;
      let res;
      let isError = false;
      let handler;
      if (middleware[i2]) {
        handler = middleware[i2][0][0];
        context.req.routeIndex = i2;
      } else {
        handler = i2 === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i2 + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// ../node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// ../node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// ../node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i2 = groups.length - 1; i2 >= 0; i2--) {
    const [mark] = groups[i2];
    for (let j2 = paths.length - 1; j2 >= 0; j2--) {
      if (paths[j2].includes(mark)) {
        paths[j2] = paths[j2].replace(mark, groups[i2][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i2 = start;
  for (; i2 < url.length; i2++) {
    const charCode = url.charCodeAt(i2);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i2);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i2);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v2, i2, a2) => a2.indexOf(v2) === i2);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// ../node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// ../node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c2) => c2({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// ../node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k2, v2] of this.#res.headers.entries()) {
        if (k2 === "content-type") {
          continue;
        }
        if (k2 === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k2, v2);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k2, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          responseHeaders.set(k2, v2);
        } else {
          responseHeaders.delete(k2);
          for (const v22 of v2) {
            responseHeaders.append(k2, v22);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};

// ../node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// ../node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../node_modules/hono/dist/hono-base.js
var notFoundHandler = (c2) => {
  return c2.text("404 Not Found", 404);
};
var errorHandler = (err, c2) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c2.newResponse(res.body, res);
  }
  console.error(err);
  return c2.text("Internal Server Error", 500);
};
var Hono = class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p2 of [path].flat()) {
        this.#path = p2;
        for (const m2 of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m2.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r2) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r2.handler;
      } else {
        handler = async (c2, next) => (await compose([], app2.errorHandler)(c2, () => r2.handler(c2, next))).res;
        handler[COMPOSED_HANDLER] = r2.handler;
      }
      subApp.#addRoute(r2.method, r2.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c2) => {
      const options2 = optionHandler(c2);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c2) => {
      let executionContext = void 0;
      try {
        executionContext = c2.executionCtx;
      } catch {
      }
      return [c2.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c2, next) => {
      const res = await applicationHandler(replaceRequest(c2.req.raw), ...getOptions(c2));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r2 = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r2]);
    this.routes.push(r2);
  }
  #handleError(err, c2) {
    if (err instanceof Error) {
      return this.errorHandler(err, c2);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c2 = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c2, async () => {
          c2.res = await this.#notFoundHandler(c2);
        });
      } catch (err) {
        return this.#handleError(err, c2);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c2.finalized ? c2.res : this.#notFoundHandler(c2))
      ).catch((err) => this.#handleError(err, c2)) : res ?? this.#notFoundHandler(c2);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c2);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c2);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// ../node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = (method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  };
  this.match = match2;
  return match2(method, path);
}

// ../node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a2, b2) {
  if (a2.length === 1) {
    return b2.length === 1 ? a2 < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a2 === ONLY_WILDCARD_REG_EXP_STR || a2 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a2 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a2.length === b2.length ? a2 < b2 ? -1 : 1 : b2.length - a2.length;
}
var Node = class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k2) => k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k2) => k2.length > 1 && k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k2) => {
      const c2 = this.#children[k2];
      return (typeof c2.#varIndex === "number" ? `(${k2})@${c2.#varIndex}` : regExpMetaChars.has(k2) ? `\\${k2}` : k2) + c2.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// ../node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i2 = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i2}`;
        groups[i2] = [mark, m2];
        i2++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      const [mark] = groups[i2];
      for (let j2 = tokens.length - 1; j2 >= 0; j2--) {
        if (tokens[j2].indexOf(mark) !== -1) {
          tokens[j2] = tokens[j2].replace(mark, groups[i2][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_2, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// ../node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_2, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i2 = 0, j2 = -1, len = routesWithStaticPathFlag.length; i2 < len; i2++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i2];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h2]) => [h2, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j2++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j2, pathErrorCheckOnly);
    } catch (e2) {
      throw e2 === PATH_ERROR ? new UnsupportedPathError(path) : e2;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j2] = handlers.map(([h2, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h2, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i2 = 0, len = handlerData.length; i2 < len; i2++) {
    for (let j2 = 0, len2 = handlerData[i2].length; j2 < len2; j2++) {
      const map = handlerData[i2][j2]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k2 = 0, len3 = keys.length; k2 < len3; k2++) {
        map[keys[k2]] = paramReplacementMap[map[keys[k2]]];
      }
    }
  }
  const handlerMap = [];
  for (const i2 in indexReplacementMap) {
    handlerMap[i2] = handlerData[indexReplacementMap[i2]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k2 of Object.keys(middleware).sort((a2, b2) => b2.length - a2.length)) {
    if (buildWildcardRegExp(k2).test(path)) {
      return [...middleware[k2]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re2 = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          middleware[m2][path] ||= findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p2) => {
            re2.test(p2) && middleware[m2][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p2) => re2.test(p2) && routes[m2][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i2 = 0, len = paths.length; i2 < len; i2++) {
      const path2 = paths[i2];
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          routes[m2][path2] ||= [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m2][path2].push([handler, paramCount - len + i2 + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r2) => {
      const ownRoute = r2[method] ? Object.keys(r2[method]).map((path) => [path, r2[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r2[METHOD_NAME_ALL]).map((path) => [path, r2[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// ../node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i2 = 0;
    let res;
    for (; i2 < len; i2++) {
      const router = routers[i2];
      try {
        for (let i22 = 0, len2 = routes.length; i22 < len2; i22++) {
          router.add(...routes[i22]);
        }
        res = router.match(method, path);
      } catch (e2) {
        if (e2 instanceof UnsupportedPathError) {
          continue;
        }
        throw e2;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i2 === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// ../node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m2 = /* @__PURE__ */ Object.create(null);
      m2[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m2];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i2 = 0, len = parts.length; i2 < len; i2++) {
      const p2 = parts[i2];
      const nextP = parts[i2 + 1];
      const pattern = getPattern(p2, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p2;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v2, i2, a2) => a2.indexOf(v2) === i2),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i2 = 0, len = node.#methods.length; i2 < len; i2++) {
      const m2 = node.#methods[i2];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i22 = 0, len2 = handlerSet.possibleKeys.length; i22 < len2; i22++) {
            const key = handlerSet.possibleKeys[i22];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i2 = 0, len = parts.length; i2 < len; i2++) {
      const part = parts[i2];
      const isLast = i2 === len - 1;
      const tempNodes = [];
      for (let j2 = 0, len2 = curNodes.length; j2 < len2; j2++) {
        const node = curNodes[j2];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k2 = 0, len3 = node.#patterns.length; k2 < len3; k2++) {
          const pattern = node.#patterns[k2];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i2).join("/");
          if (matcher instanceof RegExp) {
            const m2 = matcher.exec(restPathString);
            if (m2) {
              params[name] = m2[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m2[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a2, b2) => {
        return a2.score - b2.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// ../node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i2 = 0, len = results.length; i2 < len; i2++) {
        this.#node.insert(method, results[i2], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// ../node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// ../node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  if (name && cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = cookieValue.indexOf("%") !== -1 ? tryDecode(cookieValue, decodeURIComponent_) : cookieValue;
      if (name) {
        break;
      }
    }
  }
  return parsedCookie;
};

// ../node_modules/hono/dist/helper/cookie/index.js
var getCookie = (c2, key, prefix) => {
  const cookie = c2.req.raw.headers.get("Cookie");
  if (typeof key === "string") {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    if (prefix === "secure") {
      finalKey = "__Secure-" + key;
    } else if (prefix === "host") {
      finalKey = "__Host-" + key;
    }
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
  if (!cookie) {
    return {};
  }
  const obj = parse(cookie);
  return obj;
};

// ../node_modules/hono/dist/utils/encode.js
var decodeBase64Url = (str) => {
  return decodeBase64(str.replace(/_|-/g, (m2) => ({ _: "/", "-": "+" })[m2] ?? m2));
};
var encodeBase64Url = (buf) => encodeBase64(buf).replace(/\/|\+/g, (m2) => ({ "/": "_", "+": "-" })[m2] ?? m2);
var encodeBase64 = (buf) => {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i2 = 0, len = bytes.length; i2 < len; i2++) {
    binary += String.fromCharCode(bytes[i2]);
  }
  return btoa(binary);
};
var decodeBase64 = (str) => {
  const binary = atob(str);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  const half = binary.length / 2;
  for (let i2 = 0, j2 = binary.length - 1; i2 <= half; i2++, j2--) {
    bytes[i2] = binary.charCodeAt(i2);
    bytes[j2] = binary.charCodeAt(j2);
  }
  return bytes;
};

// ../node_modules/hono/dist/utils/jwt/jwa.js
var AlgorithmTypes = /* @__PURE__ */ ((AlgorithmTypes2) => {
  AlgorithmTypes2["HS256"] = "HS256";
  AlgorithmTypes2["HS384"] = "HS384";
  AlgorithmTypes2["HS512"] = "HS512";
  AlgorithmTypes2["RS256"] = "RS256";
  AlgorithmTypes2["RS384"] = "RS384";
  AlgorithmTypes2["RS512"] = "RS512";
  AlgorithmTypes2["PS256"] = "PS256";
  AlgorithmTypes2["PS384"] = "PS384";
  AlgorithmTypes2["PS512"] = "PS512";
  AlgorithmTypes2["ES256"] = "ES256";
  AlgorithmTypes2["ES384"] = "ES384";
  AlgorithmTypes2["ES512"] = "ES512";
  AlgorithmTypes2["EdDSA"] = "EdDSA";
  return AlgorithmTypes2;
})(AlgorithmTypes || {});

// ../node_modules/hono/dist/helper/adapter/index.js
var knownUserAgents = {
  deno: "Deno",
  bun: "Bun",
  workerd: "Cloudflare-Workers",
  node: "Node.js"
};
var getRuntimeKey = () => {
  const global2 = globalThis;
  const userAgentSupported = typeof navigator !== "undefined" && typeof navigator.userAgent === "string";
  if (userAgentSupported) {
    for (const [runtimeKey, userAgent] of Object.entries(knownUserAgents)) {
      if (checkUserAgentEquals(userAgent)) {
        return runtimeKey;
      }
    }
  }
  if (typeof global2?.EdgeRuntime === "string") {
    return "edge-light";
  }
  if (global2?.fastly !== void 0) {
    return "fastly";
  }
  if (global2?.process?.release?.name === "node") {
    return "node";
  }
  return "other";
};
var checkUserAgentEquals = (platform) => {
  const userAgent = navigator.userAgent;
  return userAgent.startsWith(platform);
};

// ../node_modules/hono/dist/utils/jwt/types.js
var JwtAlgorithmNotImplemented = class extends Error {
  constructor(alg) {
    super(`${alg} is not an implemented algorithm`);
    this.name = "JwtAlgorithmNotImplemented";
  }
};
var JwtTokenInvalid = class extends Error {
  constructor(token) {
    super(`invalid JWT token: ${token}`);
    this.name = "JwtTokenInvalid";
  }
};
var JwtTokenNotBefore = class extends Error {
  constructor(token) {
    super(`token (${token}) is being used before it's valid`);
    this.name = "JwtTokenNotBefore";
  }
};
var JwtTokenExpired = class extends Error {
  constructor(token) {
    super(`token (${token}) expired`);
    this.name = "JwtTokenExpired";
  }
};
var JwtTokenIssuedAt = class extends Error {
  constructor(currentTimestamp, iat) {
    super(
      `Invalid "iat" claim, must be a valid number lower than "${currentTimestamp}" (iat: "${iat}")`
    );
    this.name = "JwtTokenIssuedAt";
  }
};
var JwtTokenIssuer = class extends Error {
  constructor(expected, iss) {
    super(`expected issuer "${expected}", got ${iss ? `"${iss}"` : "none"} `);
    this.name = "JwtTokenIssuer";
  }
};
var JwtHeaderInvalid = class extends Error {
  constructor(header) {
    super(`jwt header is invalid: ${JSON.stringify(header)}`);
    this.name = "JwtHeaderInvalid";
  }
};
var JwtHeaderRequiresKid = class extends Error {
  constructor(header) {
    super(`required "kid" in jwt header: ${JSON.stringify(header)}`);
    this.name = "JwtHeaderRequiresKid";
  }
};
var JwtTokenSignatureMismatched = class extends Error {
  constructor(token) {
    super(`token(${token}) signature mismatched`);
    this.name = "JwtTokenSignatureMismatched";
  }
};
var JwtPayloadRequiresAud = class extends Error {
  constructor(payload) {
    super(`required "aud" in jwt payload: ${JSON.stringify(payload)}`);
    this.name = "JwtPayloadRequiresAud";
  }
};
var JwtTokenAudience = class extends Error {
  constructor(expected, aud) {
    super(
      `expected audience "${Array.isArray(expected) ? expected.join(", ") : expected}", got "${aud}"`
    );
    this.name = "JwtTokenAudience";
  }
};
var CryptoKeyUsage = /* @__PURE__ */ ((CryptoKeyUsage2) => {
  CryptoKeyUsage2["Encrypt"] = "encrypt";
  CryptoKeyUsage2["Decrypt"] = "decrypt";
  CryptoKeyUsage2["Sign"] = "sign";
  CryptoKeyUsage2["Verify"] = "verify";
  CryptoKeyUsage2["DeriveKey"] = "deriveKey";
  CryptoKeyUsage2["DeriveBits"] = "deriveBits";
  CryptoKeyUsage2["WrapKey"] = "wrapKey";
  CryptoKeyUsage2["UnwrapKey"] = "unwrapKey";
  return CryptoKeyUsage2;
})(CryptoKeyUsage || {});

// ../node_modules/hono/dist/utils/jwt/utf8.js
var utf8Encoder = new TextEncoder();
var utf8Decoder = new TextDecoder();

// ../node_modules/hono/dist/utils/jwt/jws.js
async function signing(privateKey, alg, data) {
  const algorithm = getKeyAlgorithm(alg);
  const cryptoKey = await importPrivateKey(privateKey, algorithm);
  return await crypto.subtle.sign(algorithm, cryptoKey, data);
}
async function verifying(publicKey, alg, signature, data) {
  const algorithm = getKeyAlgorithm(alg);
  const cryptoKey = await importPublicKey(publicKey, algorithm);
  return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
}
function pemToBinary(pem) {
  return decodeBase64(pem.replace(/-+(BEGIN|END).*/g, "").replace(/\s/g, ""));
}
async function importPrivateKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type !== "private" && key.type !== "secret") {
      throw new Error(
        `unexpected key type: CryptoKey.type is ${key.type}, expected private or secret`
      );
    }
    return key;
  }
  const usages = [CryptoKeyUsage.Sign];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PRIVATE")) {
    return await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function importPublicKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type === "public" || key.type === "secret") {
      return key;
    }
    key = await exportPublicJwkFrom(key);
  }
  if (typeof key === "string" && key.includes("PRIVATE")) {
    const privateKey = await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, true, [
      CryptoKeyUsage.Sign
    ]);
    key = await exportPublicJwkFrom(privateKey);
  }
  const usages = [CryptoKeyUsage.Verify];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PUBLIC")) {
    return await crypto.subtle.importKey("spki", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function exportPublicJwkFrom(privateKey) {
  if (privateKey.type !== "private") {
    throw new Error(`unexpected key type: ${privateKey.type}`);
  }
  if (!privateKey.extractable) {
    throw new Error("unexpected private key is unextractable");
  }
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  const { kty } = jwk;
  const { alg, e: e2, n: n2 } = jwk;
  const { crv, x: x2, y: y2 } = jwk;
  return { kty, alg, e: e2, n: n2, crv, x: x2, y: y2, key_ops: [CryptoKeyUsage.Verify] };
}
function getKeyAlgorithm(name) {
  switch (name) {
    case "HS256":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-256"
        }
      };
    case "HS384":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-384"
        }
      };
    case "HS512":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-512"
        }
      };
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        }
      };
    case "RS384":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-384"
        }
      };
    case "RS512":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-512"
        }
      };
    case "PS256":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-256"
        },
        saltLength: 32
      };
    case "PS384":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-384"
        },
        saltLength: 48
      };
    case "PS512":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-512"
        },
        saltLength: 64
      };
    case "ES256":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-256"
        },
        namedCurve: "P-256"
      };
    case "ES384":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-384"
        },
        namedCurve: "P-384"
      };
    case "ES512":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-512"
        },
        namedCurve: "P-521"
      };
    case "EdDSA":
      return {
        name: "Ed25519",
        namedCurve: "Ed25519"
      };
    default:
      throw new JwtAlgorithmNotImplemented(name);
  }
}
function isCryptoKey(key) {
  const runtime = getRuntimeKey();
  if (runtime === "node" && !!crypto.webcrypto) {
    return key instanceof crypto.webcrypto.CryptoKey;
  }
  return key instanceof CryptoKey;
}

// ../node_modules/hono/dist/utils/jwt/jwt.js
var encodeJwtPart = (part) => encodeBase64Url(utf8Encoder.encode(JSON.stringify(part)).buffer).replace(/=/g, "");
var encodeSignaturePart = (buf) => encodeBase64Url(buf).replace(/=/g, "");
var decodeJwtPart = (part) => JSON.parse(utf8Decoder.decode(decodeBase64Url(part)));
function isTokenHeader(obj) {
  if (typeof obj === "object" && obj !== null) {
    const objWithAlg = obj;
    return "alg" in objWithAlg && Object.values(AlgorithmTypes).includes(objWithAlg.alg) && (!("typ" in objWithAlg) || objWithAlg.typ === "JWT");
  }
  return false;
}
var sign = async (payload, privateKey, alg = "HS256") => {
  const encodedPayload = encodeJwtPart(payload);
  let encodedHeader;
  if (typeof privateKey === "object" && "alg" in privateKey) {
    alg = privateKey.alg;
    encodedHeader = encodeJwtPart({ alg, typ: "JWT", kid: privateKey.kid });
  } else {
    encodedHeader = encodeJwtPart({ alg, typ: "JWT" });
  }
  const partialToken = `${encodedHeader}.${encodedPayload}`;
  const signaturePart = await signing(privateKey, alg, utf8Encoder.encode(partialToken));
  const signature = encodeSignaturePart(signaturePart);
  return `${partialToken}.${signature}`;
};
var verify = async (token, publicKey, algOrOptions) => {
  const {
    alg = "HS256",
    iss,
    nbf = true,
    exp = true,
    iat = true,
    aud
  } = typeof algOrOptions === "string" ? { alg: algOrOptions } : algOrOptions || {};
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    throw new JwtTokenInvalid(token);
  }
  const { header, payload } = decode(token);
  if (!isTokenHeader(header)) {
    throw new JwtHeaderInvalid(header);
  }
  const now = Date.now() / 1e3 | 0;
  if (nbf && payload.nbf && payload.nbf > now) {
    throw new JwtTokenNotBefore(token);
  }
  if (exp && payload.exp && payload.exp <= now) {
    throw new JwtTokenExpired(token);
  }
  if (iat && payload.iat && now < payload.iat) {
    throw new JwtTokenIssuedAt(now, payload.iat);
  }
  if (iss) {
    if (!payload.iss) {
      throw new JwtTokenIssuer(iss, null);
    }
    if (typeof iss === "string" && payload.iss !== iss) {
      throw new JwtTokenIssuer(iss, payload.iss);
    }
    if (iss instanceof RegExp && !iss.test(payload.iss)) {
      throw new JwtTokenIssuer(iss, payload.iss);
    }
  }
  if (aud) {
    if (!payload.aud) {
      throw new JwtPayloadRequiresAud(payload);
    }
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    const matched = audiences.some(
      (payloadAud) => aud instanceof RegExp ? aud.test(payloadAud) : typeof aud === "string" ? payloadAud === aud : Array.isArray(aud) && aud.includes(payloadAud)
    );
    if (!matched) {
      throw new JwtTokenAudience(aud, payload.aud);
    }
  }
  const headerPayload = token.substring(0, token.lastIndexOf("."));
  const verified = await verifying(
    publicKey,
    alg,
    decodeBase64Url(tokenParts[2]),
    utf8Encoder.encode(headerPayload)
  );
  if (!verified) {
    throw new JwtTokenSignatureMismatched(token);
  }
  return payload;
};
var verifyWithJwks = async (token, options, init) => {
  const verifyOpts = options.verification || {};
  const header = decodeHeader(token);
  if (!isTokenHeader(header)) {
    throw new JwtHeaderInvalid(header);
  }
  if (!header.kid) {
    throw new JwtHeaderRequiresKid(header);
  }
  if (options.jwks_uri) {
    const response = await fetch(options.jwks_uri, init);
    if (!response.ok) {
      throw new Error(`failed to fetch JWKS from ${options.jwks_uri}`);
    }
    const data = await response.json();
    if (!data.keys) {
      throw new Error('invalid JWKS response. "keys" field is missing');
    }
    if (!Array.isArray(data.keys)) {
      throw new Error('invalid JWKS response. "keys" field is not an array');
    }
    if (options.keys) {
      options.keys.push(...data.keys);
    } else {
      options.keys = data.keys;
    }
  } else if (!options.keys) {
    throw new Error('verifyWithJwks requires options for either "keys" or "jwks_uri" or both');
  }
  const matchingKey = options.keys.find((key) => key.kid === header.kid);
  if (!matchingKey) {
    throw new JwtTokenInvalid(token);
  }
  return await verify(token, matchingKey, {
    alg: matchingKey.alg || header.alg,
    ...verifyOpts
  });
};
var decode = (token) => {
  try {
    const [h2, p2] = token.split(".");
    const header = decodeJwtPart(h2);
    const payload = decodeJwtPart(p2);
    return {
      header,
      payload
    };
  } catch {
    throw new JwtTokenInvalid(token);
  }
};
var decodeHeader = (token) => {
  try {
    const [h2] = token.split(".");
    return decodeJwtPart(h2);
  } catch {
    throw new JwtTokenInvalid(token);
  }
};

// ../node_modules/hono/dist/utils/jwt/index.js
var Jwt = { sign, verify, decode, verifyWithJwks };

// ../node_modules/hono/dist/middleware/jwt/jwt.js
var verifyWithJwks2 = Jwt.verifyWithJwks;
var verify2 = Jwt.verify;
var decode2 = Jwt.decode;
var sign2 = Jwt.sign;

// ../node_modules/bcryptjs/index.js
var import_crypto = __toESM(require_crypto(), 1);
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i2 = 0; i2 < known.length; ++i2) {
    diff |= known.charCodeAt(i2) ^ unknown.charCodeAt(i2);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
var nextTick = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
function utf8Length(string) {
  var len = 0, c2 = 0;
  for (var i2 = 0; i2 < string.length; ++i2) {
    c2 = string.charCodeAt(i2);
    if (c2 < 128) len += 1;
    else if (c2 < 2048) len += 2;
    else if ((c2 & 64512) === 55296 && (string.charCodeAt(i2 + 1) & 64512) === 56320) {
      ++i2;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i2 = 0, k2 = string.length; i2 < k2; ++i2) {
    c1 = string.charCodeAt(i2);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i2 + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i2;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b2, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b2.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b2[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b2[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b2[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s2, len) {
  var off = 0, slen = s2.length, olen = 0, rs = [], c1, c2, c3, c4, o2, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s2.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s2.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o2 = c1 << 2 >>> 0;
    o2 |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o2));
    if (++olen >= len || off >= slen) break;
    code = s2.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o2 = (c2 & 15) << 4 >>> 0;
    o2 |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o2));
    if (++olen >= len || off >= slen) break;
    code = s2.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o2 = (c3 & 3) << 6 >>> 0;
    o2 |= c4;
    rs.push(String.fromCharCode(o2));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P2, S2) {
  var n2, l2 = lr[off], r2 = lr[off + 1];
  l2 ^= P2[0];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[1];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[2];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[3];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[4];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[5];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[6];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[7];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[8];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[9];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[10];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[11];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[12];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[13];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[14];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r2 ^= n2 ^ P2[15];
  n2 = S2[r2 >>> 24];
  n2 += S2[256 | r2 >> 16 & 255];
  n2 ^= S2[512 | r2 >> 8 & 255];
  n2 += S2[768 | r2 & 255];
  l2 ^= n2 ^ P2[16];
  lr[off] = r2 ^ P2[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l2;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i2 = 0, word = 0; i2 < 4; ++i2)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P2, S2) {
  var offset = 0, lr = [0, 0], plen = P2.length, slen = S2.length, sw;
  for (var i2 = 0; i2 < plen; i2++)
    sw = _streamtoword(key, offset), offset = sw.offp, P2[i2] = P2[i2] ^ sw.key;
  for (i2 = 0; i2 < plen; i2 += 2)
    lr = _encipher(lr, 0, P2, S2), P2[i2] = lr[0], P2[i2 + 1] = lr[1];
  for (i2 = 0; i2 < slen; i2 += 2)
    lr = _encipher(lr, 0, P2, S2), S2[i2] = lr[0], S2[i2 + 1] = lr[1];
}
function _ekskey(data, key, P2, S2) {
  var offp = 0, lr = [0, 0], plen = P2.length, slen = S2.length, sw;
  for (var i2 = 0; i2 < plen; i2++)
    sw = _streamtoword(key, offp), offp = sw.offp, P2[i2] = P2[i2] ^ sw.key;
  offp = 0;
  for (i2 = 0; i2 < plen; i2 += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P2, S2), P2[i2] = lr[0], P2[i2 + 1] = lr[1];
  for (i2 = 0; i2 < slen; i2 += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P2, S2), S2[i2] = lr[0], S2[i2 + 1] = lr[1];
}
function _crypt(b2, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P2, S2, i2 = 0, j2;
  if (typeof Int32Array === "function") {
    P2 = new Int32Array(P_ORIG);
    S2 = new Int32Array(S_ORIG);
  } else {
    P2 = P_ORIG.slice();
    S2 = S_ORIG.slice();
  }
  _ekskey(salt, b2, P2, S2);
  function next() {
    if (progressCallback) progressCallback(i2 / rounds);
    if (i2 < rounds) {
      var start = Date.now();
      for (; i2 < rounds; ) {
        i2 = i2 + 1;
        _key(b2, P2, S2);
        _key(salt, P2, S2);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i2 = 0; i2 < 64; i2++)
        for (j2 = 0; j2 < clen >> 1; j2++) _encipher(cdata, j2 << 1, P2, S2);
      var ret = [];
      for (i2 = 0; i2 < clen; i2++)
        ret.push((cdata[i2] >> 24 & 255) >>> 0), ret.push((cdata[i2] >> 16 & 255) >>> 0), ret.push((cdata[i2] >> 8 & 255) >>> 0), ret.push((cdata[i2] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase642(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase642(string, length) {
  return base64_decode(string, length);
}
var bcryptjs_default = {
  setRandomFallback,
  genSaltSync,
  genSalt,
  hashSync,
  hash,
  compareSync,
  compare,
  getRounds,
  getSalt,
  truncates,
  encodeBase64: encodeBase642,
  decodeBase64: decodeBase642
};

// ../node_modules/webdav/dist/web/index.js
var t = { 2: (t2) => {
  function e2(t3, e3, o2) {
    t3 instanceof RegExp && (t3 = n2(t3, o2)), e3 instanceof RegExp && (e3 = n2(e3, o2));
    var i2 = r2(t3, e3, o2);
    return i2 && { start: i2[0], end: i2[1], pre: o2.slice(0, i2[0]), body: o2.slice(i2[0] + t3.length, i2[1]), post: o2.slice(i2[1] + e3.length) };
  }
  function n2(t3, e3) {
    var n3 = e3.match(t3);
    return n3 ? n3[0] : null;
  }
  function r2(t3, e3, n3) {
    var r3, o2, i2, s2, a2, u2 = n3.indexOf(t3), c2 = n3.indexOf(e3, u2 + 1), l2 = u2;
    if (u2 >= 0 && c2 > 0) {
      for (r3 = [], i2 = n3.length; l2 >= 0 && !a2; ) l2 == u2 ? (r3.push(l2), u2 = n3.indexOf(t3, l2 + 1)) : 1 == r3.length ? a2 = [r3.pop(), c2] : ((o2 = r3.pop()) < i2 && (i2 = o2, s2 = c2), c2 = n3.indexOf(e3, l2 + 1)), l2 = u2 < c2 && u2 >= 0 ? u2 : c2;
      r3.length && (a2 = [i2, s2]);
    }
    return a2;
  }
  t2.exports = e2, e2.range = r2;
}, 101: function(t2, e2, n2) {
  var r2;
  t2 = n2.nmd(t2), (function(o2) {
    var i2 = (t2 && t2.exports, "object" == typeof global && global);
    i2.global !== i2 && i2.window;
    var s2 = function(t3) {
      this.message = t3;
    };
    (s2.prototype = new Error()).name = "InvalidCharacterError";
    var a2 = function(t3) {
      throw new s2(t3);
    }, u2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", c2 = /[\t\n\f\r ]/g, l2 = { encode: function(t3) {
      t3 = String(t3), /[^\0-\xFF]/.test(t3) && a2("The string to be encoded contains characters outside of the Latin1 range.");
      for (var e3, n3, r3, o3, i3 = t3.length % 3, s3 = "", c3 = -1, l3 = t3.length - i3; ++c3 < l3; ) e3 = t3.charCodeAt(c3) << 16, n3 = t3.charCodeAt(++c3) << 8, r3 = t3.charCodeAt(++c3), s3 += u2.charAt((o3 = e3 + n3 + r3) >> 18 & 63) + u2.charAt(o3 >> 12 & 63) + u2.charAt(o3 >> 6 & 63) + u2.charAt(63 & o3);
      return 2 == i3 ? (e3 = t3.charCodeAt(c3) << 8, n3 = t3.charCodeAt(++c3), s3 += u2.charAt((o3 = e3 + n3) >> 10) + u2.charAt(o3 >> 4 & 63) + u2.charAt(o3 << 2 & 63) + "=") : 1 == i3 && (o3 = t3.charCodeAt(c3), s3 += u2.charAt(o3 >> 2) + u2.charAt(o3 << 4 & 63) + "=="), s3;
    }, decode: function(t3) {
      var e3 = (t3 = String(t3).replace(c2, "")).length;
      e3 % 4 == 0 && (e3 = (t3 = t3.replace(/==?$/, "")).length), (e3 % 4 == 1 || /[^+a-zA-Z0-9/]/.test(t3)) && a2("Invalid character: the string to be decoded is not correctly encoded.");
      for (var n3, r3, o3 = 0, i3 = "", s3 = -1; ++s3 < e3; ) r3 = u2.indexOf(t3.charAt(s3)), n3 = o3 % 4 ? 64 * n3 + r3 : r3, o3++ % 4 && (i3 += String.fromCharCode(255 & n3 >> (-2 * o3 & 6)));
      return i3;
    }, version: "1.0.0" };
    void 0 === (r2 = function() {
      return l2;
    }.call(e2, n2, e2, t2)) || (t2.exports = r2);
  })();
}, 172: (t2, e2) => {
  e2.d = function(t3) {
    if (!t3) return 0;
    for (var e3 = (t3 = t3.toString()).length, n2 = t3.length; n2--; ) {
      var r2 = t3.charCodeAt(n2);
      56320 <= r2 && r2 <= 57343 && n2--, 127 < r2 && r2 <= 2047 ? e3++ : 2047 < r2 && r2 <= 65535 && (e3 += 2);
    }
    return e3;
  };
}, 526: (t2) => {
  var e2 = { utf8: { stringToBytes: function(t3) {
    return e2.bin.stringToBytes(unescape(encodeURIComponent(t3)));
  }, bytesToString: function(t3) {
    return decodeURIComponent(escape(e2.bin.bytesToString(t3)));
  } }, bin: { stringToBytes: function(t3) {
    for (var e3 = [], n2 = 0; n2 < t3.length; n2++) e3.push(255 & t3.charCodeAt(n2));
    return e3;
  }, bytesToString: function(t3) {
    for (var e3 = [], n2 = 0; n2 < t3.length; n2++) e3.push(String.fromCharCode(t3[n2]));
    return e3.join("");
  } } };
  t2.exports = e2;
}, 298: (t2) => {
  var e2, n2;
  e2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", n2 = { rotl: function(t3, e3) {
    return t3 << e3 | t3 >>> 32 - e3;
  }, rotr: function(t3, e3) {
    return t3 << 32 - e3 | t3 >>> e3;
  }, endian: function(t3) {
    if (t3.constructor == Number) return 16711935 & n2.rotl(t3, 8) | 4278255360 & n2.rotl(t3, 24);
    for (var e3 = 0; e3 < t3.length; e3++) t3[e3] = n2.endian(t3[e3]);
    return t3;
  }, randomBytes: function(t3) {
    for (var e3 = []; t3 > 0; t3--) e3.push(Math.floor(256 * Math.random()));
    return e3;
  }, bytesToWords: function(t3) {
    for (var e3 = [], n3 = 0, r2 = 0; n3 < t3.length; n3++, r2 += 8) e3[r2 >>> 5] |= t3[n3] << 24 - r2 % 32;
    return e3;
  }, wordsToBytes: function(t3) {
    for (var e3 = [], n3 = 0; n3 < 32 * t3.length; n3 += 8) e3.push(t3[n3 >>> 5] >>> 24 - n3 % 32 & 255);
    return e3;
  }, bytesToHex: function(t3) {
    for (var e3 = [], n3 = 0; n3 < t3.length; n3++) e3.push((t3[n3] >>> 4).toString(16)), e3.push((15 & t3[n3]).toString(16));
    return e3.join("");
  }, hexToBytes: function(t3) {
    for (var e3 = [], n3 = 0; n3 < t3.length; n3 += 2) e3.push(parseInt(t3.substr(n3, 2), 16));
    return e3;
  }, bytesToBase64: function(t3) {
    for (var n3 = [], r2 = 0; r2 < t3.length; r2 += 3) for (var o2 = t3[r2] << 16 | t3[r2 + 1] << 8 | t3[r2 + 2], i2 = 0; i2 < 4; i2++) 8 * r2 + 6 * i2 <= 8 * t3.length ? n3.push(e2.charAt(o2 >>> 6 * (3 - i2) & 63)) : n3.push("=");
    return n3.join("");
  }, base64ToBytes: function(t3) {
    t3 = t3.replace(/[^A-Z0-9+\/]/gi, "");
    for (var n3 = [], r2 = 0, o2 = 0; r2 < t3.length; o2 = ++r2 % 4) 0 != o2 && n3.push((e2.indexOf(t3.charAt(r2 - 1)) & Math.pow(2, -2 * o2 + 8) - 1) << 2 * o2 | e2.indexOf(t3.charAt(r2)) >>> 6 - 2 * o2);
    return n3;
  } }, t2.exports = n2;
}, 635: (t2, e2, n2) => {
  const r2 = n2(31), o2 = n2(338), i2 = n2(221);
  t2.exports = { XMLParser: o2, XMLValidator: r2, XMLBuilder: i2 };
}, 118: (t2) => {
  t2.exports = function(t3) {
    return "function" == typeof t3 ? t3 : Array.isArray(t3) ? (e2) => {
      for (const n2 of t3) {
        if ("string" == typeof n2 && e2 === n2) return true;
        if (n2 instanceof RegExp && n2.test(e2)) return true;
      }
    } : () => false;
  };
}, 705: (t2, e2) => {
  const n2 = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", r2 = "[" + n2 + "][" + n2 + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*", o2 = new RegExp("^" + r2 + "$");
  e2.isExist = function(t3) {
    return void 0 !== t3;
  }, e2.isEmptyObject = function(t3) {
    return 0 === Object.keys(t3).length;
  }, e2.merge = function(t3, e3, n3) {
    if (e3) {
      const r3 = Object.keys(e3), o3 = r3.length;
      for (let i2 = 0; i2 < o3; i2++) t3[r3[i2]] = "strict" === n3 ? [e3[r3[i2]]] : e3[r3[i2]];
    }
  }, e2.getValue = function(t3) {
    return e2.isExist(t3) ? t3 : "";
  }, e2.isName = function(t3) {
    return !(null == o2.exec(t3));
  }, e2.getAllMatches = function(t3, e3) {
    const n3 = [];
    let r3 = e3.exec(t3);
    for (; r3; ) {
      const o3 = [];
      o3.startIndex = e3.lastIndex - r3[0].length;
      const i2 = r3.length;
      for (let t4 = 0; t4 < i2; t4++) o3.push(r3[t4]);
      n3.push(o3), r3 = e3.exec(t3);
    }
    return n3;
  }, e2.nameRegexp = r2;
}, 31: (t2, e2, n2) => {
  const r2 = n2(705), o2 = { allowBooleanAttributes: false, unpairedTags: [] };
  function i2(t3) {
    return " " === t3 || "	" === t3 || "\n" === t3 || "\r" === t3;
  }
  function s2(t3, e3) {
    const n3 = e3;
    for (; e3 < t3.length; e3++) if ("?" != t3[e3] && " " != t3[e3]) ;
    else {
      const r3 = t3.substr(n3, e3 - n3);
      if (e3 > 5 && "xml" === r3) return d2("InvalidXml", "XML declaration allowed only at the start of the document.", m2(t3, e3));
      if ("?" == t3[e3] && ">" == t3[e3 + 1]) {
        e3++;
        break;
      }
    }
    return e3;
  }
  function a2(t3, e3) {
    if (t3.length > e3 + 5 && "-" === t3[e3 + 1] && "-" === t3[e3 + 2]) {
      for (e3 += 3; e3 < t3.length; e3++) if ("-" === t3[e3] && "-" === t3[e3 + 1] && ">" === t3[e3 + 2]) {
        e3 += 2;
        break;
      }
    } else if (t3.length > e3 + 8 && "D" === t3[e3 + 1] && "O" === t3[e3 + 2] && "C" === t3[e3 + 3] && "T" === t3[e3 + 4] && "Y" === t3[e3 + 5] && "P" === t3[e3 + 6] && "E" === t3[e3 + 7]) {
      let n3 = 1;
      for (e3 += 8; e3 < t3.length; e3++) if ("<" === t3[e3]) n3++;
      else if (">" === t3[e3] && (n3--, 0 === n3)) break;
    } else if (t3.length > e3 + 9 && "[" === t3[e3 + 1] && "C" === t3[e3 + 2] && "D" === t3[e3 + 3] && "A" === t3[e3 + 4] && "T" === t3[e3 + 5] && "A" === t3[e3 + 6] && "[" === t3[e3 + 7]) {
      for (e3 += 8; e3 < t3.length; e3++) if ("]" === t3[e3] && "]" === t3[e3 + 1] && ">" === t3[e3 + 2]) {
        e3 += 2;
        break;
      }
    }
    return e3;
  }
  e2.validate = function(t3, e3) {
    e3 = Object.assign({}, o2, e3);
    const n3 = [];
    let u3 = false, c3 = false;
    "\uFEFF" === t3[0] && (t3 = t3.substr(1));
    for (let o3 = 0; o3 < t3.length; o3++) if ("<" === t3[o3] && "?" === t3[o3 + 1]) {
      if (o3 += 2, o3 = s2(t3, o3), o3.err) return o3;
    } else {
      if ("<" !== t3[o3]) {
        if (i2(t3[o3])) continue;
        return d2("InvalidChar", "char '" + t3[o3] + "' is not expected.", m2(t3, o3));
      }
      {
        let g3 = o3;
        if (o3++, "!" === t3[o3]) {
          o3 = a2(t3, o3);
          continue;
        }
        {
          let y3 = false;
          "/" === t3[o3] && (y3 = true, o3++);
          let v2 = "";
          for (; o3 < t3.length && ">" !== t3[o3] && " " !== t3[o3] && "	" !== t3[o3] && "\n" !== t3[o3] && "\r" !== t3[o3]; o3++) v2 += t3[o3];
          if (v2 = v2.trim(), "/" === v2[v2.length - 1] && (v2 = v2.substring(0, v2.length - 1), o3--), h3 = v2, !r2.isName(h3)) {
            let e4;
            return e4 = 0 === v2.trim().length ? "Invalid space after '<'." : "Tag '" + v2 + "' is an invalid name.", d2("InvalidTag", e4, m2(t3, o3));
          }
          const b2 = l2(t3, o3);
          if (false === b2) return d2("InvalidAttr", "Attributes for '" + v2 + "' have open quote.", m2(t3, o3));
          let w2 = b2.value;
          if (o3 = b2.index, "/" === w2[w2.length - 1]) {
            const n4 = o3 - w2.length;
            w2 = w2.substring(0, w2.length - 1);
            const r3 = p2(w2, e3);
            if (true !== r3) return d2(r3.err.code, r3.err.msg, m2(t3, n4 + r3.err.line));
            u3 = true;
          } else if (y3) {
            if (!b2.tagClosed) return d2("InvalidTag", "Closing tag '" + v2 + "' doesn't have proper closing.", m2(t3, o3));
            if (w2.trim().length > 0) return d2("InvalidTag", "Closing tag '" + v2 + "' can't have attributes or invalid starting.", m2(t3, g3));
            if (0 === n3.length) return d2("InvalidTag", "Closing tag '" + v2 + "' has not been opened.", m2(t3, g3));
            {
              const e4 = n3.pop();
              if (v2 !== e4.tagName) {
                let n4 = m2(t3, e4.tagStartPos);
                return d2("InvalidTag", "Expected closing tag '" + e4.tagName + "' (opened in line " + n4.line + ", col " + n4.col + ") instead of closing tag '" + v2 + "'.", m2(t3, g3));
              }
              0 == n3.length && (c3 = true);
            }
          } else {
            const r3 = p2(w2, e3);
            if (true !== r3) return d2(r3.err.code, r3.err.msg, m2(t3, o3 - w2.length + r3.err.line));
            if (true === c3) return d2("InvalidXml", "Multiple possible root nodes found.", m2(t3, o3));
            -1 !== e3.unpairedTags.indexOf(v2) || n3.push({ tagName: v2, tagStartPos: g3 }), u3 = true;
          }
          for (o3++; o3 < t3.length; o3++) if ("<" === t3[o3]) {
            if ("!" === t3[o3 + 1]) {
              o3++, o3 = a2(t3, o3);
              continue;
            }
            if ("?" !== t3[o3 + 1]) break;
            if (o3 = s2(t3, ++o3), o3.err) return o3;
          } else if ("&" === t3[o3]) {
            const e4 = f2(t3, o3);
            if (-1 == e4) return d2("InvalidChar", "char '&' is not expected.", m2(t3, o3));
            o3 = e4;
          } else if (true === c3 && !i2(t3[o3])) return d2("InvalidXml", "Extra text at the end", m2(t3, o3));
          "<" === t3[o3] && o3--;
        }
      }
    }
    var h3;
    return u3 ? 1 == n3.length ? d2("InvalidTag", "Unclosed tag '" + n3[0].tagName + "'.", m2(t3, n3[0].tagStartPos)) : !(n3.length > 0) || d2("InvalidXml", "Invalid '" + JSON.stringify(n3.map(((t4) => t4.tagName)), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 }) : d2("InvalidXml", "Start tag expected.", 1);
  };
  const u2 = '"', c2 = "'";
  function l2(t3, e3) {
    let n3 = "", r3 = "", o3 = false;
    for (; e3 < t3.length; e3++) {
      if (t3[e3] === u2 || t3[e3] === c2) "" === r3 ? r3 = t3[e3] : r3 !== t3[e3] || (r3 = "");
      else if (">" === t3[e3] && "" === r3) {
        o3 = true;
        break;
      }
      n3 += t3[e3];
    }
    return "" === r3 && { value: n3, index: e3, tagClosed: o3 };
  }
  const h2 = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
  function p2(t3, e3) {
    const n3 = r2.getAllMatches(t3, h2), o3 = {};
    for (let t4 = 0; t4 < n3.length; t4++) {
      if (0 === n3[t4][1].length) return d2("InvalidAttr", "Attribute '" + n3[t4][2] + "' has no space in starting.", y2(n3[t4]));
      if (void 0 !== n3[t4][3] && void 0 === n3[t4][4]) return d2("InvalidAttr", "Attribute '" + n3[t4][2] + "' is without value.", y2(n3[t4]));
      if (void 0 === n3[t4][3] && !e3.allowBooleanAttributes) return d2("InvalidAttr", "boolean attribute '" + n3[t4][2] + "' is not allowed.", y2(n3[t4]));
      const r3 = n3[t4][2];
      if (!g2(r3)) return d2("InvalidAttr", "Attribute '" + r3 + "' is an invalid name.", y2(n3[t4]));
      if (o3.hasOwnProperty(r3)) return d2("InvalidAttr", "Attribute '" + r3 + "' is repeated.", y2(n3[t4]));
      o3[r3] = 1;
    }
    return true;
  }
  function f2(t3, e3) {
    if (";" === t3[++e3]) return -1;
    if ("#" === t3[e3]) return (function(t4, e4) {
      let n4 = /\d/;
      for ("x" === t4[e4] && (e4++, n4 = /[\da-fA-F]/); e4 < t4.length; e4++) {
        if (";" === t4[e4]) return e4;
        if (!t4[e4].match(n4)) break;
      }
      return -1;
    })(t3, ++e3);
    let n3 = 0;
    for (; e3 < t3.length; e3++, n3++) if (!(t3[e3].match(/\w/) && n3 < 20)) {
      if (";" === t3[e3]) break;
      return -1;
    }
    return e3;
  }
  function d2(t3, e3, n3) {
    return { err: { code: t3, msg: e3, line: n3.line || n3, col: n3.col } };
  }
  function g2(t3) {
    return r2.isName(t3);
  }
  function m2(t3, e3) {
    const n3 = t3.substring(0, e3).split(/\r?\n/);
    return { line: n3.length, col: n3[n3.length - 1].length + 1 };
  }
  function y2(t3) {
    return t3.startIndex + t3[1].length;
  }
}, 221: (t2, e2, n2) => {
  const r2 = n2(87), o2 = n2(118), i2 = { attributeNamePrefix: "@_", attributesGroupName: false, textNodeName: "#text", ignoreAttributes: true, cdataPropName: false, format: false, indentBy: "  ", suppressEmptyNode: false, suppressUnpairedNode: true, suppressBooleanAttributes: true, tagValueProcessor: function(t3, e3) {
    return e3;
  }, attributeValueProcessor: function(t3, e3) {
    return e3;
  }, preserveOrder: false, commentPropName: false, unpairedTags: [], entities: [{ regex: new RegExp("&", "g"), val: "&amp;" }, { regex: new RegExp(">", "g"), val: "&gt;" }, { regex: new RegExp("<", "g"), val: "&lt;" }, { regex: new RegExp("'", "g"), val: "&apos;" }, { regex: new RegExp('"', "g"), val: "&quot;" }], processEntities: true, stopNodes: [], oneListGroup: false };
  function s2(t3) {
    this.options = Object.assign({}, i2, t3), true === this.options.ignoreAttributes || this.options.attributesGroupName ? this.isAttribute = function() {
      return false;
    } : (this.ignoreAttributesFn = o2(this.options.ignoreAttributes), this.attrPrefixLen = this.options.attributeNamePrefix.length, this.isAttribute = c2), this.processTextOrObjNode = a2, this.options.format ? (this.indentate = u2, this.tagEndChar = ">\n", this.newLine = "\n") : (this.indentate = function() {
      return "";
    }, this.tagEndChar = ">", this.newLine = "");
  }
  function a2(t3, e3, n3, r3) {
    const o3 = this.j2x(t3, n3 + 1, r3.concat(e3));
    return void 0 !== t3[this.options.textNodeName] && 1 === Object.keys(t3).length ? this.buildTextValNode(t3[this.options.textNodeName], e3, o3.attrStr, n3) : this.buildObjectNode(o3.val, e3, o3.attrStr, n3);
  }
  function u2(t3) {
    return this.options.indentBy.repeat(t3);
  }
  function c2(t3) {
    return !(!t3.startsWith(this.options.attributeNamePrefix) || t3 === this.options.textNodeName) && t3.substr(this.attrPrefixLen);
  }
  s2.prototype.build = function(t3) {
    return this.options.preserveOrder ? r2(t3, this.options) : (Array.isArray(t3) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1 && (t3 = { [this.options.arrayNodeName]: t3 }), this.j2x(t3, 0, []).val);
  }, s2.prototype.j2x = function(t3, e3, n3) {
    let r3 = "", o3 = "";
    const i3 = n3.join(".");
    for (let s3 in t3) if (Object.prototype.hasOwnProperty.call(t3, s3)) if (void 0 === t3[s3]) this.isAttribute(s3) && (o3 += "");
    else if (null === t3[s3]) this.isAttribute(s3) ? o3 += "" : "?" === s3[0] ? o3 += this.indentate(e3) + "<" + s3 + "?" + this.tagEndChar : o3 += this.indentate(e3) + "<" + s3 + "/" + this.tagEndChar;
    else if (t3[s3] instanceof Date) o3 += this.buildTextValNode(t3[s3], s3, "", e3);
    else if ("object" != typeof t3[s3]) {
      const n4 = this.isAttribute(s3);
      if (n4 && !this.ignoreAttributesFn(n4, i3)) r3 += this.buildAttrPairStr(n4, "" + t3[s3]);
      else if (!n4) if (s3 === this.options.textNodeName) {
        let e4 = this.options.tagValueProcessor(s3, "" + t3[s3]);
        o3 += this.replaceEntitiesValue(e4);
      } else o3 += this.buildTextValNode(t3[s3], s3, "", e3);
    } else if (Array.isArray(t3[s3])) {
      const r4 = t3[s3].length;
      let i4 = "", a3 = "";
      for (let u3 = 0; u3 < r4; u3++) {
        const r5 = t3[s3][u3];
        if (void 0 === r5) ;
        else if (null === r5) "?" === s3[0] ? o3 += this.indentate(e3) + "<" + s3 + "?" + this.tagEndChar : o3 += this.indentate(e3) + "<" + s3 + "/" + this.tagEndChar;
        else if ("object" == typeof r5) if (this.options.oneListGroup) {
          const t4 = this.j2x(r5, e3 + 1, n3.concat(s3));
          i4 += t4.val, this.options.attributesGroupName && r5.hasOwnProperty(this.options.attributesGroupName) && (a3 += t4.attrStr);
        } else i4 += this.processTextOrObjNode(r5, s3, e3, n3);
        else if (this.options.oneListGroup) {
          let t4 = this.options.tagValueProcessor(s3, r5);
          t4 = this.replaceEntitiesValue(t4), i4 += t4;
        } else i4 += this.buildTextValNode(r5, s3, "", e3);
      }
      this.options.oneListGroup && (i4 = this.buildObjectNode(i4, s3, a3, e3)), o3 += i4;
    } else if (this.options.attributesGroupName && s3 === this.options.attributesGroupName) {
      const e4 = Object.keys(t3[s3]), n4 = e4.length;
      for (let o4 = 0; o4 < n4; o4++) r3 += this.buildAttrPairStr(e4[o4], "" + t3[s3][e4[o4]]);
    } else o3 += this.processTextOrObjNode(t3[s3], s3, e3, n3);
    return { attrStr: r3, val: o3 };
  }, s2.prototype.buildAttrPairStr = function(t3, e3) {
    return e3 = this.options.attributeValueProcessor(t3, "" + e3), e3 = this.replaceEntitiesValue(e3), this.options.suppressBooleanAttributes && "true" === e3 ? " " + t3 : " " + t3 + '="' + e3 + '"';
  }, s2.prototype.buildObjectNode = function(t3, e3, n3, r3) {
    if ("" === t3) return "?" === e3[0] ? this.indentate(r3) + "<" + e3 + n3 + "?" + this.tagEndChar : this.indentate(r3) + "<" + e3 + n3 + this.closeTag(e3) + this.tagEndChar;
    {
      let o3 = "</" + e3 + this.tagEndChar, i3 = "";
      return "?" === e3[0] && (i3 = "?", o3 = ""), !n3 && "" !== n3 || -1 !== t3.indexOf("<") ? false !== this.options.commentPropName && e3 === this.options.commentPropName && 0 === i3.length ? this.indentate(r3) + `<!--${t3}-->` + this.newLine : this.indentate(r3) + "<" + e3 + n3 + i3 + this.tagEndChar + t3 + this.indentate(r3) + o3 : this.indentate(r3) + "<" + e3 + n3 + i3 + ">" + t3 + o3;
    }
  }, s2.prototype.closeTag = function(t3) {
    let e3 = "";
    return -1 !== this.options.unpairedTags.indexOf(t3) ? this.options.suppressUnpairedNode || (e3 = "/") : e3 = this.options.suppressEmptyNode ? "/" : `></${t3}`, e3;
  }, s2.prototype.buildTextValNode = function(t3, e3, n3, r3) {
    if (false !== this.options.cdataPropName && e3 === this.options.cdataPropName) return this.indentate(r3) + `<![CDATA[${t3}]]>` + this.newLine;
    if (false !== this.options.commentPropName && e3 === this.options.commentPropName) return this.indentate(r3) + `<!--${t3}-->` + this.newLine;
    if ("?" === e3[0]) return this.indentate(r3) + "<" + e3 + n3 + "?" + this.tagEndChar;
    {
      let o3 = this.options.tagValueProcessor(e3, t3);
      return o3 = this.replaceEntitiesValue(o3), "" === o3 ? this.indentate(r3) + "<" + e3 + n3 + this.closeTag(e3) + this.tagEndChar : this.indentate(r3) + "<" + e3 + n3 + ">" + o3 + "</" + e3 + this.tagEndChar;
    }
  }, s2.prototype.replaceEntitiesValue = function(t3) {
    if (t3 && t3.length > 0 && this.options.processEntities) for (let e3 = 0; e3 < this.options.entities.length; e3++) {
      const n3 = this.options.entities[e3];
      t3 = t3.replace(n3.regex, n3.val);
    }
    return t3;
  }, t2.exports = s2;
}, 87: (t2) => {
  function e2(t3, s2, a2, u2) {
    let c2 = "", l2 = false;
    for (let h2 = 0; h2 < t3.length; h2++) {
      const p2 = t3[h2], f2 = n2(p2);
      if (void 0 === f2) continue;
      let d2 = "";
      if (d2 = 0 === a2.length ? f2 : `${a2}.${f2}`, f2 === s2.textNodeName) {
        let t4 = p2[f2];
        o2(d2, s2) || (t4 = s2.tagValueProcessor(f2, t4), t4 = i2(t4, s2)), l2 && (c2 += u2), c2 += t4, l2 = false;
        continue;
      }
      if (f2 === s2.cdataPropName) {
        l2 && (c2 += u2), c2 += `<![CDATA[${p2[f2][0][s2.textNodeName]}]]>`, l2 = false;
        continue;
      }
      if (f2 === s2.commentPropName) {
        c2 += u2 + `<!--${p2[f2][0][s2.textNodeName]}-->`, l2 = true;
        continue;
      }
      if ("?" === f2[0]) {
        const t4 = r2(p2[":@"], s2), e3 = "?xml" === f2 ? "" : u2;
        let n3 = p2[f2][0][s2.textNodeName];
        n3 = 0 !== n3.length ? " " + n3 : "", c2 += e3 + `<${f2}${n3}${t4}?>`, l2 = true;
        continue;
      }
      let g2 = u2;
      "" !== g2 && (g2 += s2.indentBy);
      const m2 = u2 + `<${f2}${r2(p2[":@"], s2)}`, y2 = e2(p2[f2], s2, d2, g2);
      -1 !== s2.unpairedTags.indexOf(f2) ? s2.suppressUnpairedNode ? c2 += m2 + ">" : c2 += m2 + "/>" : y2 && 0 !== y2.length || !s2.suppressEmptyNode ? y2 && y2.endsWith(">") ? c2 += m2 + `>${y2}${u2}</${f2}>` : (c2 += m2 + ">", y2 && "" !== u2 && (y2.includes("/>") || y2.includes("</")) ? c2 += u2 + s2.indentBy + y2 + u2 : c2 += y2, c2 += `</${f2}>`) : c2 += m2 + "/>", l2 = true;
    }
    return c2;
  }
  function n2(t3) {
    const e3 = Object.keys(t3);
    for (let n3 = 0; n3 < e3.length; n3++) {
      const r3 = e3[n3];
      if (t3.hasOwnProperty(r3) && ":@" !== r3) return r3;
    }
  }
  function r2(t3, e3) {
    let n3 = "";
    if (t3 && !e3.ignoreAttributes) for (let r3 in t3) {
      if (!t3.hasOwnProperty(r3)) continue;
      let o3 = e3.attributeValueProcessor(r3, t3[r3]);
      o3 = i2(o3, e3), true === o3 && e3.suppressBooleanAttributes ? n3 += ` ${r3.substr(e3.attributeNamePrefix.length)}` : n3 += ` ${r3.substr(e3.attributeNamePrefix.length)}="${o3}"`;
    }
    return n3;
  }
  function o2(t3, e3) {
    let n3 = (t3 = t3.substr(0, t3.length - e3.textNodeName.length - 1)).substr(t3.lastIndexOf(".") + 1);
    for (let r3 in e3.stopNodes) if (e3.stopNodes[r3] === t3 || e3.stopNodes[r3] === "*." + n3) return true;
    return false;
  }
  function i2(t3, e3) {
    if (t3 && t3.length > 0 && e3.processEntities) for (let n3 = 0; n3 < e3.entities.length; n3++) {
      const r3 = e3.entities[n3];
      t3 = t3.replace(r3.regex, r3.val);
    }
    return t3;
  }
  t2.exports = function(t3, n3) {
    let r3 = "";
    return n3.format && n3.indentBy.length > 0 && (r3 = "\n"), e2(t3, n3, "", r3);
  };
}, 193: (t2, e2, n2) => {
  const r2 = n2(705);
  function o2(t3, e3) {
    let n3 = "";
    for (; e3 < t3.length && "'" !== t3[e3] && '"' !== t3[e3]; e3++) n3 += t3[e3];
    if (n3 = n3.trim(), -1 !== n3.indexOf(" ")) throw new Error("External entites are not supported");
    const r3 = t3[e3++];
    let o3 = "";
    for (; e3 < t3.length && t3[e3] !== r3; e3++) o3 += t3[e3];
    return [n3, o3, e3];
  }
  function i2(t3, e3) {
    return "!" === t3[e3 + 1] && "-" === t3[e3 + 2] && "-" === t3[e3 + 3];
  }
  function s2(t3, e3) {
    return "!" === t3[e3 + 1] && "E" === t3[e3 + 2] && "N" === t3[e3 + 3] && "T" === t3[e3 + 4] && "I" === t3[e3 + 5] && "T" === t3[e3 + 6] && "Y" === t3[e3 + 7];
  }
  function a2(t3, e3) {
    return "!" === t3[e3 + 1] && "E" === t3[e3 + 2] && "L" === t3[e3 + 3] && "E" === t3[e3 + 4] && "M" === t3[e3 + 5] && "E" === t3[e3 + 6] && "N" === t3[e3 + 7] && "T" === t3[e3 + 8];
  }
  function u2(t3, e3) {
    return "!" === t3[e3 + 1] && "A" === t3[e3 + 2] && "T" === t3[e3 + 3] && "T" === t3[e3 + 4] && "L" === t3[e3 + 5] && "I" === t3[e3 + 6] && "S" === t3[e3 + 7] && "T" === t3[e3 + 8];
  }
  function c2(t3, e3) {
    return "!" === t3[e3 + 1] && "N" === t3[e3 + 2] && "O" === t3[e3 + 3] && "T" === t3[e3 + 4] && "A" === t3[e3 + 5] && "T" === t3[e3 + 6] && "I" === t3[e3 + 7] && "O" === t3[e3 + 8] && "N" === t3[e3 + 9];
  }
  function l2(t3) {
    if (r2.isName(t3)) return t3;
    throw new Error(`Invalid entity name ${t3}`);
  }
  t2.exports = function(t3, e3) {
    const n3 = {};
    if ("O" !== t3[e3 + 3] || "C" !== t3[e3 + 4] || "T" !== t3[e3 + 5] || "Y" !== t3[e3 + 6] || "P" !== t3[e3 + 7] || "E" !== t3[e3 + 8]) throw new Error("Invalid Tag instead of DOCTYPE");
    {
      e3 += 9;
      let r3 = 1, h2 = false, p2 = false, f2 = "";
      for (; e3 < t3.length; e3++) if ("<" !== t3[e3] || p2) if (">" === t3[e3]) {
        if (p2 ? "-" === t3[e3 - 1] && "-" === t3[e3 - 2] && (p2 = false, r3--) : r3--, 0 === r3) break;
      } else "[" === t3[e3] ? h2 = true : f2 += t3[e3];
      else {
        if (h2 && s2(t3, e3)) {
          let r4, i3;
          e3 += 7, [r4, i3, e3] = o2(t3, e3 + 1), -1 === i3.indexOf("&") && (n3[l2(r4)] = { regx: RegExp(`&${r4};`, "g"), val: i3 });
        } else if (h2 && a2(t3, e3)) e3 += 8;
        else if (h2 && u2(t3, e3)) e3 += 8;
        else if (h2 && c2(t3, e3)) e3 += 9;
        else {
          if (!i2) throw new Error("Invalid DOCTYPE");
          p2 = true;
        }
        r3++, f2 = "";
      }
      if (0 !== r3) throw new Error("Unclosed DOCTYPE");
    }
    return { entities: n3, i: e3 };
  };
}, 63: (t2, e2) => {
  const n2 = { preserveOrder: false, attributeNamePrefix: "@_", attributesGroupName: false, textNodeName: "#text", ignoreAttributes: true, removeNSPrefix: false, allowBooleanAttributes: false, parseTagValue: true, parseAttributeValue: false, trimValues: true, cdataPropName: false, numberParseOptions: { hex: true, leadingZeros: true, eNotation: true }, tagValueProcessor: function(t3, e3) {
    return e3;
  }, attributeValueProcessor: function(t3, e3) {
    return e3;
  }, stopNodes: [], alwaysCreateTextNode: false, isArray: () => false, commentPropName: false, unpairedTags: [], processEntities: true, htmlEntities: false, ignoreDeclaration: false, ignorePiTags: false, transformTagName: false, transformAttributeName: false, updateTag: function(t3, e3, n3) {
    return t3;
  } };
  e2.buildOptions = function(t3) {
    return Object.assign({}, n2, t3);
  }, e2.defaultOptions = n2;
}, 299: (t2, e2, n2) => {
  const r2 = n2(705), o2 = n2(365), i2 = n2(193), s2 = n2(494), a2 = n2(118);
  function u2(t3) {
    const e3 = Object.keys(t3);
    for (let n3 = 0; n3 < e3.length; n3++) {
      const r3 = e3[n3];
      this.lastEntities[r3] = { regex: new RegExp("&" + r3 + ";", "g"), val: t3[r3] };
    }
  }
  function c2(t3, e3, n3, r3, o3, i3, s3) {
    if (void 0 !== t3 && (this.options.trimValues && !r3 && (t3 = t3.trim()), t3.length > 0)) {
      s3 || (t3 = this.replaceEntitiesValue(t3));
      const r4 = this.options.tagValueProcessor(e3, t3, n3, o3, i3);
      return null == r4 ? t3 : typeof r4 != typeof t3 || r4 !== t3 ? r4 : this.options.trimValues || t3.trim() === t3 ? x2(t3, this.options.parseTagValue, this.options.numberParseOptions) : t3;
    }
  }
  function l2(t3) {
    if (this.options.removeNSPrefix) {
      const e3 = t3.split(":"), n3 = "/" === t3.charAt(0) ? "/" : "";
      if ("xmlns" === e3[0]) return "";
      2 === e3.length && (t3 = n3 + e3[1]);
    }
    return t3;
  }
  const h2 = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
  function p2(t3, e3, n3) {
    if (true !== this.options.ignoreAttributes && "string" == typeof t3) {
      const n4 = r2.getAllMatches(t3, h2), o3 = n4.length, i3 = {};
      for (let t4 = 0; t4 < o3; t4++) {
        const r3 = this.resolveNameSpace(n4[t4][1]);
        if (this.ignoreAttributesFn(r3, e3)) continue;
        let o4 = n4[t4][4], s3 = this.options.attributeNamePrefix + r3;
        if (r3.length) if (this.options.transformAttributeName && (s3 = this.options.transformAttributeName(s3)), "__proto__" === s3 && (s3 = "#__proto__"), void 0 !== o4) {
          this.options.trimValues && (o4 = o4.trim()), o4 = this.replaceEntitiesValue(o4);
          const t5 = this.options.attributeValueProcessor(r3, o4, e3);
          i3[s3] = null == t5 ? o4 : typeof t5 != typeof o4 || t5 !== o4 ? t5 : x2(o4, this.options.parseAttributeValue, this.options.numberParseOptions);
        } else this.options.allowBooleanAttributes && (i3[s3] = true);
      }
      if (!Object.keys(i3).length) return;
      if (this.options.attributesGroupName) {
        const t4 = {};
        return t4[this.options.attributesGroupName] = i3, t4;
      }
      return i3;
    }
  }
  const f2 = function(t3) {
    t3 = t3.replace(/\r\n?/g, "\n");
    const e3 = new o2("!xml");
    let n3 = e3, r3 = "", s3 = "";
    for (let a3 = 0; a3 < t3.length; a3++) if ("<" === t3[a3]) if ("/" === t3[a3 + 1]) {
      const e4 = v2(t3, ">", a3, "Closing Tag is not closed.");
      let o3 = t3.substring(a3 + 2, e4).trim();
      if (this.options.removeNSPrefix) {
        const t4 = o3.indexOf(":");
        -1 !== t4 && (o3 = o3.substr(t4 + 1));
      }
      this.options.transformTagName && (o3 = this.options.transformTagName(o3)), n3 && (r3 = this.saveTextToParentTag(r3, n3, s3));
      const i3 = s3.substring(s3.lastIndexOf(".") + 1);
      if (o3 && -1 !== this.options.unpairedTags.indexOf(o3)) throw new Error(`Unpaired tag can not be used as closing tag: </${o3}>`);
      let u3 = 0;
      i3 && -1 !== this.options.unpairedTags.indexOf(i3) ? (u3 = s3.lastIndexOf(".", s3.lastIndexOf(".") - 1), this.tagsNodeStack.pop()) : u3 = s3.lastIndexOf("."), s3 = s3.substring(0, u3), n3 = this.tagsNodeStack.pop(), r3 = "", a3 = e4;
    } else if ("?" === t3[a3 + 1]) {
      let e4 = b2(t3, a3, false, "?>");
      if (!e4) throw new Error("Pi Tag is not closed.");
      if (r3 = this.saveTextToParentTag(r3, n3, s3), this.options.ignoreDeclaration && "?xml" === e4.tagName || this.options.ignorePiTags) ;
      else {
        const t4 = new o2(e4.tagName);
        t4.add(this.options.textNodeName, ""), e4.tagName !== e4.tagExp && e4.attrExpPresent && (t4[":@"] = this.buildAttributesMap(e4.tagExp, s3, e4.tagName)), this.addChild(n3, t4, s3);
      }
      a3 = e4.closeIndex + 1;
    } else if ("!--" === t3.substr(a3 + 1, 3)) {
      const e4 = v2(t3, "-->", a3 + 4, "Comment is not closed.");
      if (this.options.commentPropName) {
        const o3 = t3.substring(a3 + 4, e4 - 2);
        r3 = this.saveTextToParentTag(r3, n3, s3), n3.add(this.options.commentPropName, [{ [this.options.textNodeName]: o3 }]);
      }
      a3 = e4;
    } else if ("!D" === t3.substr(a3 + 1, 2)) {
      const e4 = i2(t3, a3);
      this.docTypeEntities = e4.entities, a3 = e4.i;
    } else if ("![" === t3.substr(a3 + 1, 2)) {
      const e4 = v2(t3, "]]>", a3, "CDATA is not closed.") - 2, o3 = t3.substring(a3 + 9, e4);
      r3 = this.saveTextToParentTag(r3, n3, s3);
      let i3 = this.parseTextData(o3, n3.tagname, s3, true, false, true, true);
      null == i3 && (i3 = ""), this.options.cdataPropName ? n3.add(this.options.cdataPropName, [{ [this.options.textNodeName]: o3 }]) : n3.add(this.options.textNodeName, i3), a3 = e4 + 2;
    } else {
      let i3 = b2(t3, a3, this.options.removeNSPrefix), u3 = i3.tagName;
      const c3 = i3.rawTagName;
      let l3 = i3.tagExp, h3 = i3.attrExpPresent, p3 = i3.closeIndex;
      this.options.transformTagName && (u3 = this.options.transformTagName(u3)), n3 && r3 && "!xml" !== n3.tagname && (r3 = this.saveTextToParentTag(r3, n3, s3, false));
      const f3 = n3;
      if (f3 && -1 !== this.options.unpairedTags.indexOf(f3.tagname) && (n3 = this.tagsNodeStack.pop(), s3 = s3.substring(0, s3.lastIndexOf("."))), u3 !== e3.tagname && (s3 += s3 ? "." + u3 : u3), this.isItStopNode(this.options.stopNodes, s3, u3)) {
        let e4 = "";
        if (l3.length > 0 && l3.lastIndexOf("/") === l3.length - 1) "/" === u3[u3.length - 1] ? (u3 = u3.substr(0, u3.length - 1), s3 = s3.substr(0, s3.length - 1), l3 = u3) : l3 = l3.substr(0, l3.length - 1), a3 = i3.closeIndex;
        else if (-1 !== this.options.unpairedTags.indexOf(u3)) a3 = i3.closeIndex;
        else {
          const n4 = this.readStopNodeData(t3, c3, p3 + 1);
          if (!n4) throw new Error(`Unexpected end of ${c3}`);
          a3 = n4.i, e4 = n4.tagContent;
        }
        const r4 = new o2(u3);
        u3 !== l3 && h3 && (r4[":@"] = this.buildAttributesMap(l3, s3, u3)), e4 && (e4 = this.parseTextData(e4, u3, s3, true, h3, true, true)), s3 = s3.substr(0, s3.lastIndexOf(".")), r4.add(this.options.textNodeName, e4), this.addChild(n3, r4, s3);
      } else {
        if (l3.length > 0 && l3.lastIndexOf("/") === l3.length - 1) {
          "/" === u3[u3.length - 1] ? (u3 = u3.substr(0, u3.length - 1), s3 = s3.substr(0, s3.length - 1), l3 = u3) : l3 = l3.substr(0, l3.length - 1), this.options.transformTagName && (u3 = this.options.transformTagName(u3));
          const t4 = new o2(u3);
          u3 !== l3 && h3 && (t4[":@"] = this.buildAttributesMap(l3, s3, u3)), this.addChild(n3, t4, s3), s3 = s3.substr(0, s3.lastIndexOf("."));
        } else {
          const t4 = new o2(u3);
          this.tagsNodeStack.push(n3), u3 !== l3 && h3 && (t4[":@"] = this.buildAttributesMap(l3, s3, u3)), this.addChild(n3, t4, s3), n3 = t4;
        }
        r3 = "", a3 = p3;
      }
    }
    else r3 += t3[a3];
    return e3.child;
  };
  function d2(t3, e3, n3) {
    const r3 = this.options.updateTag(e3.tagname, n3, e3[":@"]);
    false === r3 || ("string" == typeof r3 ? (e3.tagname = r3, t3.addChild(e3)) : t3.addChild(e3));
  }
  const g2 = function(t3) {
    if (this.options.processEntities) {
      for (let e3 in this.docTypeEntities) {
        const n3 = this.docTypeEntities[e3];
        t3 = t3.replace(n3.regx, n3.val);
      }
      for (let e3 in this.lastEntities) {
        const n3 = this.lastEntities[e3];
        t3 = t3.replace(n3.regex, n3.val);
      }
      if (this.options.htmlEntities) for (let e3 in this.htmlEntities) {
        const n3 = this.htmlEntities[e3];
        t3 = t3.replace(n3.regex, n3.val);
      }
      t3 = t3.replace(this.ampEntity.regex, this.ampEntity.val);
    }
    return t3;
  };
  function m2(t3, e3, n3, r3) {
    return t3 && (void 0 === r3 && (r3 = 0 === Object.keys(e3.child).length), void 0 !== (t3 = this.parseTextData(t3, e3.tagname, n3, false, !!e3[":@"] && 0 !== Object.keys(e3[":@"]).length, r3)) && "" !== t3 && e3.add(this.options.textNodeName, t3), t3 = ""), t3;
  }
  function y2(t3, e3, n3) {
    const r3 = "*." + n3;
    for (const n4 in t3) {
      const o3 = t3[n4];
      if (r3 === o3 || e3 === o3) return true;
    }
    return false;
  }
  function v2(t3, e3, n3, r3) {
    const o3 = t3.indexOf(e3, n3);
    if (-1 === o3) throw new Error(r3);
    return o3 + e3.length - 1;
  }
  function b2(t3, e3, n3) {
    const r3 = (function(t4, e4) {
      let n4, r4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : ">", o4 = "";
      for (let i4 = e4; i4 < t4.length; i4++) {
        let e5 = t4[i4];
        if (n4) e5 === n4 && (n4 = "");
        else if ('"' === e5 || "'" === e5) n4 = e5;
        else if (e5 === r4[0]) {
          if (!r4[1]) return { data: o4, index: i4 };
          if (t4[i4 + 1] === r4[1]) return { data: o4, index: i4 };
        } else "	" === e5 && (e5 = " ");
        o4 += e5;
      }
    })(t3, e3 + 1, arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : ">");
    if (!r3) return;
    let o3 = r3.data;
    const i3 = r3.index, s3 = o3.search(/\s/);
    let a3 = o3, u3 = true;
    -1 !== s3 && (a3 = o3.substring(0, s3), o3 = o3.substring(s3 + 1).trimStart());
    const c3 = a3;
    if (n3) {
      const t4 = a3.indexOf(":");
      -1 !== t4 && (a3 = a3.substr(t4 + 1), u3 = a3 !== r3.data.substr(t4 + 1));
    }
    return { tagName: a3, tagExp: o3, closeIndex: i3, attrExpPresent: u3, rawTagName: c3 };
  }
  function w2(t3, e3, n3) {
    const r3 = n3;
    let o3 = 1;
    for (; n3 < t3.length; n3++) if ("<" === t3[n3]) if ("/" === t3[n3 + 1]) {
      const i3 = v2(t3, ">", n3, `${e3} is not closed`);
      if (t3.substring(n3 + 2, i3).trim() === e3 && (o3--, 0 === o3)) return { tagContent: t3.substring(r3, n3), i: i3 };
      n3 = i3;
    } else if ("?" === t3[n3 + 1]) n3 = v2(t3, "?>", n3 + 1, "StopNode is not closed.");
    else if ("!--" === t3.substr(n3 + 1, 3)) n3 = v2(t3, "-->", n3 + 3, "StopNode is not closed.");
    else if ("![" === t3.substr(n3 + 1, 2)) n3 = v2(t3, "]]>", n3, "StopNode is not closed.") - 2;
    else {
      const r4 = b2(t3, n3, ">");
      r4 && ((r4 && r4.tagName) === e3 && "/" !== r4.tagExp[r4.tagExp.length - 1] && o3++, n3 = r4.closeIndex);
    }
  }
  function x2(t3, e3, n3) {
    if (e3 && "string" == typeof t3) {
      const e4 = t3.trim();
      return "true" === e4 || "false" !== e4 && s2(t3, n3);
    }
    return r2.isExist(t3) ? t3 : "";
  }
  t2.exports = class {
    constructor(t3) {
      this.options = t3, this.currentNode = null, this.tagsNodeStack = [], this.docTypeEntities = {}, this.lastEntities = { apos: { regex: /&(apos|#39|#x27);/g, val: "'" }, gt: { regex: /&(gt|#62|#x3E);/g, val: ">" }, lt: { regex: /&(lt|#60|#x3C);/g, val: "<" }, quot: { regex: /&(quot|#34|#x22);/g, val: '"' } }, this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" }, this.htmlEntities = { space: { regex: /&(nbsp|#160);/g, val: " " }, cent: { regex: /&(cent|#162);/g, val: "\xA2" }, pound: { regex: /&(pound|#163);/g, val: "\xA3" }, yen: { regex: /&(yen|#165);/g, val: "\xA5" }, euro: { regex: /&(euro|#8364);/g, val: "\u20AC" }, copyright: { regex: /&(copy|#169);/g, val: "\xA9" }, reg: { regex: /&(reg|#174);/g, val: "\xAE" }, inr: { regex: /&(inr|#8377);/g, val: "\u20B9" }, num_dec: { regex: /&#([0-9]{1,7});/g, val: (t4, e3) => String.fromCharCode(Number.parseInt(e3, 10)) }, num_hex: { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (t4, e3) => String.fromCharCode(Number.parseInt(e3, 16)) } }, this.addExternalEntities = u2, this.parseXml = f2, this.parseTextData = c2, this.resolveNameSpace = l2, this.buildAttributesMap = p2, this.isItStopNode = y2, this.replaceEntitiesValue = g2, this.readStopNodeData = w2, this.saveTextToParentTag = m2, this.addChild = d2, this.ignoreAttributesFn = a2(this.options.ignoreAttributes);
    }
  };
}, 338: (t2, e2, n2) => {
  const { buildOptions: r2 } = n2(63), o2 = n2(299), { prettify: i2 } = n2(728), s2 = n2(31);
  t2.exports = class {
    constructor(t3) {
      this.externalEntities = {}, this.options = r2(t3);
    }
    parse(t3, e3) {
      if ("string" == typeof t3) ;
      else {
        if (!t3.toString) throw new Error("XML data is accepted in String or Bytes[] form.");
        t3 = t3.toString();
      }
      if (e3) {
        true === e3 && (e3 = {});
        const n4 = s2.validate(t3, e3);
        if (true !== n4) throw Error(`${n4.err.msg}:${n4.err.line}:${n4.err.col}`);
      }
      const n3 = new o2(this.options);
      n3.addExternalEntities(this.externalEntities);
      const r3 = n3.parseXml(t3);
      return this.options.preserveOrder || void 0 === r3 ? r3 : i2(r3, this.options);
    }
    addEntity(t3, e3) {
      if (-1 !== e3.indexOf("&")) throw new Error("Entity value can't have '&'");
      if (-1 !== t3.indexOf("&") || -1 !== t3.indexOf(";")) throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
      if ("&" === e3) throw new Error("An entity with value '&' is not permitted");
      this.externalEntities[t3] = e3;
    }
  };
}, 728: (t2, e2) => {
  function n2(t3, e3, s2) {
    let a2;
    const u2 = {};
    for (let c2 = 0; c2 < t3.length; c2++) {
      const l2 = t3[c2], h2 = r2(l2);
      let p2 = "";
      if (p2 = void 0 === s2 ? h2 : s2 + "." + h2, h2 === e3.textNodeName) void 0 === a2 ? a2 = l2[h2] : a2 += "" + l2[h2];
      else {
        if (void 0 === h2) continue;
        if (l2[h2]) {
          let t4 = n2(l2[h2], e3, p2);
          const r3 = i2(t4, e3);
          l2[":@"] ? o2(t4, l2[":@"], p2, e3) : 1 !== Object.keys(t4).length || void 0 === t4[e3.textNodeName] || e3.alwaysCreateTextNode ? 0 === Object.keys(t4).length && (e3.alwaysCreateTextNode ? t4[e3.textNodeName] = "" : t4 = "") : t4 = t4[e3.textNodeName], void 0 !== u2[h2] && u2.hasOwnProperty(h2) ? (Array.isArray(u2[h2]) || (u2[h2] = [u2[h2]]), u2[h2].push(t4)) : e3.isArray(h2, p2, r3) ? u2[h2] = [t4] : u2[h2] = t4;
        }
      }
    }
    return "string" == typeof a2 ? a2.length > 0 && (u2[e3.textNodeName] = a2) : void 0 !== a2 && (u2[e3.textNodeName] = a2), u2;
  }
  function r2(t3) {
    const e3 = Object.keys(t3);
    for (let t4 = 0; t4 < e3.length; t4++) {
      const n3 = e3[t4];
      if (":@" !== n3) return n3;
    }
  }
  function o2(t3, e3, n3, r3) {
    if (e3) {
      const o3 = Object.keys(e3), i3 = o3.length;
      for (let s2 = 0; s2 < i3; s2++) {
        const i4 = o3[s2];
        r3.isArray(i4, n3 + "." + i4, true, true) ? t3[i4] = [e3[i4]] : t3[i4] = e3[i4];
      }
    }
  }
  function i2(t3, e3) {
    const { textNodeName: n3 } = e3, r3 = Object.keys(t3).length;
    return 0 === r3 || !(1 !== r3 || !t3[n3] && "boolean" != typeof t3[n3] && 0 !== t3[n3]);
  }
  e2.prettify = function(t3, e3) {
    return n2(t3, e3);
  };
}, 365: (t2) => {
  t2.exports = class {
    constructor(t3) {
      this.tagname = t3, this.child = [], this[":@"] = {};
    }
    add(t3, e2) {
      "__proto__" === t3 && (t3 = "#__proto__"), this.child.push({ [t3]: e2 });
    }
    addChild(t3) {
      "__proto__" === t3.tagname && (t3.tagname = "#__proto__"), t3[":@"] && Object.keys(t3[":@"]).length > 0 ? this.child.push({ [t3.tagname]: t3.child, ":@": t3[":@"] }) : this.child.push({ [t3.tagname]: t3.child });
    }
  };
}, 135: (t2) => {
  function e2(t3) {
    return !!t3.constructor && "function" == typeof t3.constructor.isBuffer && t3.constructor.isBuffer(t3);
  }
  t2.exports = function(t3) {
    return null != t3 && (e2(t3) || (function(t4) {
      return "function" == typeof t4.readFloatLE && "function" == typeof t4.slice && e2(t4.slice(0, 0));
    })(t3) || !!t3._isBuffer);
  };
}, 542: (t2, e2, n2) => {
  !(function() {
    var e3 = n2(298), r2 = n2(526).utf8, o2 = n2(135), i2 = n2(526).bin, s2 = function(t3, n3) {
      t3.constructor == String ? t3 = n3 && "binary" === n3.encoding ? i2.stringToBytes(t3) : r2.stringToBytes(t3) : o2(t3) ? t3 = Array.prototype.slice.call(t3, 0) : Array.isArray(t3) || t3.constructor === Uint8Array || (t3 = t3.toString());
      for (var a2 = e3.bytesToWords(t3), u2 = 8 * t3.length, c2 = 1732584193, l2 = -271733879, h2 = -1732584194, p2 = 271733878, f2 = 0; f2 < a2.length; f2++) a2[f2] = 16711935 & (a2[f2] << 8 | a2[f2] >>> 24) | 4278255360 & (a2[f2] << 24 | a2[f2] >>> 8);
      a2[u2 >>> 5] |= 128 << u2 % 32, a2[14 + (u2 + 64 >>> 9 << 4)] = u2;
      var d2 = s2._ff, g2 = s2._gg, m2 = s2._hh, y2 = s2._ii;
      for (f2 = 0; f2 < a2.length; f2 += 16) {
        var v2 = c2, b2 = l2, w2 = h2, x2 = p2;
        c2 = d2(c2, l2, h2, p2, a2[f2 + 0], 7, -680876936), p2 = d2(p2, c2, l2, h2, a2[f2 + 1], 12, -389564586), h2 = d2(h2, p2, c2, l2, a2[f2 + 2], 17, 606105819), l2 = d2(l2, h2, p2, c2, a2[f2 + 3], 22, -1044525330), c2 = d2(c2, l2, h2, p2, a2[f2 + 4], 7, -176418897), p2 = d2(p2, c2, l2, h2, a2[f2 + 5], 12, 1200080426), h2 = d2(h2, p2, c2, l2, a2[f2 + 6], 17, -1473231341), l2 = d2(l2, h2, p2, c2, a2[f2 + 7], 22, -45705983), c2 = d2(c2, l2, h2, p2, a2[f2 + 8], 7, 1770035416), p2 = d2(p2, c2, l2, h2, a2[f2 + 9], 12, -1958414417), h2 = d2(h2, p2, c2, l2, a2[f2 + 10], 17, -42063), l2 = d2(l2, h2, p2, c2, a2[f2 + 11], 22, -1990404162), c2 = d2(c2, l2, h2, p2, a2[f2 + 12], 7, 1804603682), p2 = d2(p2, c2, l2, h2, a2[f2 + 13], 12, -40341101), h2 = d2(h2, p2, c2, l2, a2[f2 + 14], 17, -1502002290), c2 = g2(c2, l2 = d2(l2, h2, p2, c2, a2[f2 + 15], 22, 1236535329), h2, p2, a2[f2 + 1], 5, -165796510), p2 = g2(p2, c2, l2, h2, a2[f2 + 6], 9, -1069501632), h2 = g2(h2, p2, c2, l2, a2[f2 + 11], 14, 643717713), l2 = g2(l2, h2, p2, c2, a2[f2 + 0], 20, -373897302), c2 = g2(c2, l2, h2, p2, a2[f2 + 5], 5, -701558691), p2 = g2(p2, c2, l2, h2, a2[f2 + 10], 9, 38016083), h2 = g2(h2, p2, c2, l2, a2[f2 + 15], 14, -660478335), l2 = g2(l2, h2, p2, c2, a2[f2 + 4], 20, -405537848), c2 = g2(c2, l2, h2, p2, a2[f2 + 9], 5, 568446438), p2 = g2(p2, c2, l2, h2, a2[f2 + 14], 9, -1019803690), h2 = g2(h2, p2, c2, l2, a2[f2 + 3], 14, -187363961), l2 = g2(l2, h2, p2, c2, a2[f2 + 8], 20, 1163531501), c2 = g2(c2, l2, h2, p2, a2[f2 + 13], 5, -1444681467), p2 = g2(p2, c2, l2, h2, a2[f2 + 2], 9, -51403784), h2 = g2(h2, p2, c2, l2, a2[f2 + 7], 14, 1735328473), c2 = m2(c2, l2 = g2(l2, h2, p2, c2, a2[f2 + 12], 20, -1926607734), h2, p2, a2[f2 + 5], 4, -378558), p2 = m2(p2, c2, l2, h2, a2[f2 + 8], 11, -2022574463), h2 = m2(h2, p2, c2, l2, a2[f2 + 11], 16, 1839030562), l2 = m2(l2, h2, p2, c2, a2[f2 + 14], 23, -35309556), c2 = m2(c2, l2, h2, p2, a2[f2 + 1], 4, -1530992060), p2 = m2(p2, c2, l2, h2, a2[f2 + 4], 11, 1272893353), h2 = m2(h2, p2, c2, l2, a2[f2 + 7], 16, -155497632), l2 = m2(l2, h2, p2, c2, a2[f2 + 10], 23, -1094730640), c2 = m2(c2, l2, h2, p2, a2[f2 + 13], 4, 681279174), p2 = m2(p2, c2, l2, h2, a2[f2 + 0], 11, -358537222), h2 = m2(h2, p2, c2, l2, a2[f2 + 3], 16, -722521979), l2 = m2(l2, h2, p2, c2, a2[f2 + 6], 23, 76029189), c2 = m2(c2, l2, h2, p2, a2[f2 + 9], 4, -640364487), p2 = m2(p2, c2, l2, h2, a2[f2 + 12], 11, -421815835), h2 = m2(h2, p2, c2, l2, a2[f2 + 15], 16, 530742520), c2 = y2(c2, l2 = m2(l2, h2, p2, c2, a2[f2 + 2], 23, -995338651), h2, p2, a2[f2 + 0], 6, -198630844), p2 = y2(p2, c2, l2, h2, a2[f2 + 7], 10, 1126891415), h2 = y2(h2, p2, c2, l2, a2[f2 + 14], 15, -1416354905), l2 = y2(l2, h2, p2, c2, a2[f2 + 5], 21, -57434055), c2 = y2(c2, l2, h2, p2, a2[f2 + 12], 6, 1700485571), p2 = y2(p2, c2, l2, h2, a2[f2 + 3], 10, -1894986606), h2 = y2(h2, p2, c2, l2, a2[f2 + 10], 15, -1051523), l2 = y2(l2, h2, p2, c2, a2[f2 + 1], 21, -2054922799), c2 = y2(c2, l2, h2, p2, a2[f2 + 8], 6, 1873313359), p2 = y2(p2, c2, l2, h2, a2[f2 + 15], 10, -30611744), h2 = y2(h2, p2, c2, l2, a2[f2 + 6], 15, -1560198380), l2 = y2(l2, h2, p2, c2, a2[f2 + 13], 21, 1309151649), c2 = y2(c2, l2, h2, p2, a2[f2 + 4], 6, -145523070), p2 = y2(p2, c2, l2, h2, a2[f2 + 11], 10, -1120210379), h2 = y2(h2, p2, c2, l2, a2[f2 + 2], 15, 718787259), l2 = y2(l2, h2, p2, c2, a2[f2 + 9], 21, -343485551), c2 = c2 + v2 >>> 0, l2 = l2 + b2 >>> 0, h2 = h2 + w2 >>> 0, p2 = p2 + x2 >>> 0;
      }
      return e3.endian([c2, l2, h2, p2]);
    };
    s2._ff = function(t3, e4, n3, r3, o3, i3, s3) {
      var a2 = t3 + (e4 & n3 | ~e4 & r3) + (o3 >>> 0) + s3;
      return (a2 << i3 | a2 >>> 32 - i3) + e4;
    }, s2._gg = function(t3, e4, n3, r3, o3, i3, s3) {
      var a2 = t3 + (e4 & r3 | n3 & ~r3) + (o3 >>> 0) + s3;
      return (a2 << i3 | a2 >>> 32 - i3) + e4;
    }, s2._hh = function(t3, e4, n3, r3, o3, i3, s3) {
      var a2 = t3 + (e4 ^ n3 ^ r3) + (o3 >>> 0) + s3;
      return (a2 << i3 | a2 >>> 32 - i3) + e4;
    }, s2._ii = function(t3, e4, n3, r3, o3, i3, s3) {
      var a2 = t3 + (n3 ^ (e4 | ~r3)) + (o3 >>> 0) + s3;
      return (a2 << i3 | a2 >>> 32 - i3) + e4;
    }, s2._blocksize = 16, s2._digestsize = 16, t2.exports = function(t3, n3) {
      if (null == t3) throw new Error("Illegal argument " + t3);
      var r3 = e3.wordsToBytes(s2(t3, n3));
      return n3 && n3.asBytes ? r3 : n3 && n3.asString ? i2.bytesToString(r3) : e3.bytesToHex(r3);
    };
  })();
}, 285: (t2, e2, n2) => {
  var r2 = n2(2);
  t2.exports = function(t3) {
    return t3 ? ("{}" === t3.substr(0, 2) && (t3 = "\\{\\}" + t3.substr(2)), m2((function(t4) {
      return t4.split("\\\\").join(o2).split("\\{").join(i2).split("\\}").join(s2).split("\\,").join(a2).split("\\.").join(u2);
    })(t3), true).map(l2)) : [];
  };
  var o2 = "\0SLASH" + Math.random() + "\0", i2 = "\0OPEN" + Math.random() + "\0", s2 = "\0CLOSE" + Math.random() + "\0", a2 = "\0COMMA" + Math.random() + "\0", u2 = "\0PERIOD" + Math.random() + "\0";
  function c2(t3) {
    return parseInt(t3, 10) == t3 ? parseInt(t3, 10) : t3.charCodeAt(0);
  }
  function l2(t3) {
    return t3.split(o2).join("\\").split(i2).join("{").split(s2).join("}").split(a2).join(",").split(u2).join(".");
  }
  function h2(t3) {
    if (!t3) return [""];
    var e3 = [], n3 = r2("{", "}", t3);
    if (!n3) return t3.split(",");
    var o3 = n3.pre, i3 = n3.body, s3 = n3.post, a3 = o3.split(",");
    a3[a3.length - 1] += "{" + i3 + "}";
    var u3 = h2(s3);
    return s3.length && (a3[a3.length - 1] += u3.shift(), a3.push.apply(a3, u3)), e3.push.apply(e3, a3), e3;
  }
  function p2(t3) {
    return "{" + t3 + "}";
  }
  function f2(t3) {
    return /^-?0\d/.test(t3);
  }
  function d2(t3, e3) {
    return t3 <= e3;
  }
  function g2(t3, e3) {
    return t3 >= e3;
  }
  function m2(t3, e3) {
    var n3 = [], o3 = r2("{", "}", t3);
    if (!o3) return [t3];
    var i3 = o3.pre, a3 = o3.post.length ? m2(o3.post, false) : [""];
    if (/\$$/.test(o3.pre)) for (var u3 = 0; u3 < a3.length; u3++) {
      var l3 = i3 + "{" + o3.body + "}" + a3[u3];
      n3.push(l3);
    }
    else {
      var y2, v2, b2 = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(o3.body), w2 = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(o3.body), x2 = b2 || w2, N2 = o3.body.indexOf(",") >= 0;
      if (!x2 && !N2) return o3.post.match(/,.*\}/) ? m2(t3 = o3.pre + "{" + o3.body + s2 + o3.post) : [t3];
      if (x2) y2 = o3.body.split(/\.\./);
      else if (1 === (y2 = h2(o3.body)).length && 1 === (y2 = m2(y2[0], false).map(p2)).length) return a3.map((function(t4) {
        return o3.pre + y2[0] + t4;
      }));
      if (x2) {
        var A2 = c2(y2[0]), P2 = c2(y2[1]), O2 = Math.max(y2[0].length, y2[1].length), E2 = 3 == y2.length ? Math.abs(c2(y2[2])) : 1, T2 = d2;
        P2 < A2 && (E2 *= -1, T2 = g2);
        var j2 = y2.some(f2);
        v2 = [];
        for (var S2 = A2; T2(S2, P2); S2 += E2) {
          var $2;
          if (w2) "\\" === ($2 = String.fromCharCode(S2)) && ($2 = "");
          else if ($2 = String(S2), j2) {
            var C2 = O2 - $2.length;
            if (C2 > 0) {
              var I2 = new Array(C2 + 1).join("0");
              $2 = S2 < 0 ? "-" + I2 + $2.slice(1) : I2 + $2;
            }
          }
          v2.push($2);
        }
      } else {
        v2 = [];
        for (var k2 = 0; k2 < y2.length; k2++) v2.push.apply(v2, m2(y2[k2], false));
      }
      for (k2 = 0; k2 < v2.length; k2++) for (u3 = 0; u3 < a3.length; u3++) l3 = i3 + v2[k2] + a3[u3], (!e3 || x2 || l3) && n3.push(l3);
    }
    return n3;
  }
}, 829: (t2) => {
  function e2(t3) {
    return e2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t4) {
      return typeof t4;
    } : function(t4) {
      return t4 && "function" == typeof Symbol && t4.constructor === Symbol && t4 !== Symbol.prototype ? "symbol" : typeof t4;
    }, e2(t3);
  }
  function n2(t3) {
    var e3 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
    return n2 = function(t4) {
      if (null === t4 || (n3 = t4, -1 === Function.toString.call(n3).indexOf("[native code]"))) return t4;
      var n3;
      if ("function" != typeof t4) throw new TypeError("Super expression must either be null or a function");
      if (void 0 !== e3) {
        if (e3.has(t4)) return e3.get(t4);
        e3.set(t4, s3);
      }
      function s3() {
        return r2(t4, arguments, i2(this).constructor);
      }
      return s3.prototype = Object.create(t4.prototype, { constructor: { value: s3, enumerable: false, writable: true, configurable: true } }), o2(s3, t4);
    }, n2(t3);
  }
  function r2(t3, e3, n3) {
    return r2 = (function() {
      if ("undefined" == typeof Reflect || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if ("function" == typeof Proxy) return true;
      try {
        return Date.prototype.toString.call(Reflect.construct(Date, [], (function() {
        }))), true;
      } catch (t4) {
        return false;
      }
    })() ? Reflect.construct : function(t4, e4, n4) {
      var r3 = [null];
      r3.push.apply(r3, e4);
      var i3 = new (Function.bind.apply(t4, r3))();
      return n4 && o2(i3, n4.prototype), i3;
    }, r2.apply(null, arguments);
  }
  function o2(t3, e3) {
    return o2 = Object.setPrototypeOf || function(t4, e4) {
      return t4.__proto__ = e4, t4;
    }, o2(t3, e3);
  }
  function i2(t3) {
    return i2 = Object.setPrototypeOf ? Object.getPrototypeOf : function(t4) {
      return t4.__proto__ || Object.getPrototypeOf(t4);
    }, i2(t3);
  }
  var s2 = (function(t3) {
    function n3(t4) {
      var r3;
      return (function(t5, e3) {
        if (!(t5 instanceof e3)) throw new TypeError("Cannot call a class as a function");
      })(this, n3), (r3 = (function(t5, n4) {
        return !n4 || "object" !== e2(n4) && "function" != typeof n4 ? (function(t6) {
          if (void 0 === t6) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return t6;
        })(t5) : n4;
      })(this, i2(n3).call(this, t4))).name = "ObjectPrototypeMutationError", r3;
    }
    return (function(t4, e3) {
      if ("function" != typeof e3 && null !== e3) throw new TypeError("Super expression must either be null or a function");
      t4.prototype = Object.create(e3 && e3.prototype, { constructor: { value: t4, writable: true, configurable: true } }), e3 && o2(t4, e3);
    })(n3, t3), n3;
  })(n2(Error));
  function a2(t3, n3) {
    for (var r3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : function() {
    }, o3 = n3.split("."), i3 = o3.length, s3 = function(e3) {
      var n4 = o3[e3];
      if (!t3) return { v: void 0 };
      if ("+" === n4) {
        if (Array.isArray(t3)) return { v: t3.map((function(n5, i5) {
          var s4 = o3.slice(e3 + 1);
          return s4.length > 0 ? a2(n5, s4.join("."), r3) : r3(t3, i5, o3, e3);
        })) };
        var i4 = o3.slice(0, e3).join(".");
        throw new Error("Object at wildcard (".concat(i4, ") is not an array"));
      }
      t3 = r3(t3, n4, o3, e3);
    }, u3 = 0; u3 < i3; u3++) {
      var c2 = s3(u3);
      if ("object" === e2(c2)) return c2.v;
    }
    return t3;
  }
  function u2(t3, e3) {
    return t3.length === e3 + 1;
  }
  t2.exports = { set: function(t3, n3, r3) {
    if ("object" != e2(t3) || null === t3) return t3;
    if (void 0 === n3) return t3;
    if ("number" == typeof n3) return t3[n3] = r3, t3[n3];
    try {
      return a2(t3, n3, (function(t4, e3, n4, o3) {
        if (t4 === Reflect.getPrototypeOf({})) throw new s2("Attempting to mutate Object.prototype");
        if (!t4[e3]) {
          var i3 = Number.isInteger(Number(n4[o3 + 1])), a3 = "+" === n4[o3 + 1];
          t4[e3] = i3 || a3 ? [] : {};
        }
        return u2(n4, o3) && (t4[e3] = r3), t4[e3];
      }));
    } catch (e3) {
      if (e3 instanceof s2) throw e3;
      return t3;
    }
  }, get: function(t3, n3) {
    if ("object" != e2(t3) || null === t3) return t3;
    if (void 0 === n3) return t3;
    if ("number" == typeof n3) return t3[n3];
    try {
      return a2(t3, n3, (function(t4, e3) {
        return t4[e3];
      }));
    } catch (e3) {
      return t3;
    }
  }, has: function(t3, n3) {
    var r3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    if ("object" != e2(t3) || null === t3) return false;
    if (void 0 === n3) return false;
    if ("number" == typeof n3) return n3 in t3;
    try {
      var o3 = false;
      return a2(t3, n3, (function(t4, e3, n4, i3) {
        if (!u2(n4, i3)) return t4 && t4[e3];
        o3 = r3.own ? t4.hasOwnProperty(e3) : e3 in t4;
      })), o3;
    } catch (t4) {
      return false;
    }
  }, hasOwn: function(t3, e3, n3) {
    return this.has(t3, e3, n3 || { own: true });
  }, isIn: function(t3, n3, r3) {
    var o3 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
    if ("object" != e2(t3) || null === t3) return false;
    if (void 0 === n3) return false;
    try {
      var i3 = false, s3 = false;
      return a2(t3, n3, (function(t4, n4, o4, a3) {
        return i3 = i3 || t4 === r3 || !!t4 && t4[n4] === r3, s3 = u2(o4, a3) && "object" === e2(t4) && n4 in t4, t4 && t4[n4];
      })), o3.validPath ? i3 && s3 : i3;
    } catch (t4) {
      return false;
    }
  }, ObjectPrototypeMutationError: s2 };
}, 47: (t2, e2, n2) => {
  var r2 = n2(410), o2 = function(t3) {
    return "string" == typeof t3;
  };
  function i2(t3, e3) {
    for (var n3 = [], r3 = 0; r3 < t3.length; r3++) {
      var o3 = t3[r3];
      o3 && "." !== o3 && (".." === o3 ? n3.length && ".." !== n3[n3.length - 1] ? n3.pop() : e3 && n3.push("..") : n3.push(o3));
    }
    return n3;
  }
  var s2 = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/, a2 = {};
  function u2(t3) {
    return s2.exec(t3).slice(1);
  }
  a2.resolve = function() {
    for (var t3 = "", e3 = false, n3 = arguments.length - 1; n3 >= -1 && !e3; n3--) {
      var r3 = n3 >= 0 ? arguments[n3] : process.cwd();
      if (!o2(r3)) throw new TypeError("Arguments to path.resolve must be strings");
      r3 && (t3 = r3 + "/" + t3, e3 = "/" === r3.charAt(0));
    }
    return (e3 ? "/" : "") + (t3 = i2(t3.split("/"), !e3).join("/")) || ".";
  }, a2.normalize = function(t3) {
    var e3 = a2.isAbsolute(t3), n3 = "/" === t3.substr(-1);
    return (t3 = i2(t3.split("/"), !e3).join("/")) || e3 || (t3 = "."), t3 && n3 && (t3 += "/"), (e3 ? "/" : "") + t3;
  }, a2.isAbsolute = function(t3) {
    return "/" === t3.charAt(0);
  }, a2.join = function() {
    for (var t3 = "", e3 = 0; e3 < arguments.length; e3++) {
      var n3 = arguments[e3];
      if (!o2(n3)) throw new TypeError("Arguments to path.join must be strings");
      n3 && (t3 += t3 ? "/" + n3 : n3);
    }
    return a2.normalize(t3);
  }, a2.relative = function(t3, e3) {
    function n3(t4) {
      for (var e4 = 0; e4 < t4.length && "" === t4[e4]; e4++) ;
      for (var n4 = t4.length - 1; n4 >= 0 && "" === t4[n4]; n4--) ;
      return e4 > n4 ? [] : t4.slice(e4, n4 + 1);
    }
    t3 = a2.resolve(t3).substr(1), e3 = a2.resolve(e3).substr(1);
    for (var r3 = n3(t3.split("/")), o3 = n3(e3.split("/")), i3 = Math.min(r3.length, o3.length), s3 = i3, u3 = 0; u3 < i3; u3++) if (r3[u3] !== o3[u3]) {
      s3 = u3;
      break;
    }
    var c2 = [];
    for (u3 = s3; u3 < r3.length; u3++) c2.push("..");
    return (c2 = c2.concat(o3.slice(s3))).join("/");
  }, a2._makeLong = function(t3) {
    return t3;
  }, a2.dirname = function(t3) {
    var e3 = u2(t3), n3 = e3[0], r3 = e3[1];
    return n3 || r3 ? (r3 && (r3 = r3.substr(0, r3.length - 1)), n3 + r3) : ".";
  }, a2.basename = function(t3, e3) {
    var n3 = u2(t3)[2];
    return e3 && n3.substr(-1 * e3.length) === e3 && (n3 = n3.substr(0, n3.length - e3.length)), n3;
  }, a2.extname = function(t3) {
    return u2(t3)[3];
  }, a2.format = function(t3) {
    if (!r2.isObject(t3)) throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof t3);
    var e3 = t3.root || "";
    if (!o2(e3)) throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof t3.root);
    return (t3.dir ? t3.dir + a2.sep : "") + (t3.base || "");
  }, a2.parse = function(t3) {
    if (!o2(t3)) throw new TypeError("Parameter 'pathString' must be a string, not " + typeof t3);
    var e3 = u2(t3);
    if (!e3 || 4 !== e3.length) throw new TypeError("Invalid path '" + t3 + "'");
    return e3[1] = e3[1] || "", e3[2] = e3[2] || "", e3[3] = e3[3] || "", { root: e3[0], dir: e3[0] + e3[1].slice(0, e3[1].length - 1), base: e3[2], ext: e3[3], name: e3[2].slice(0, e3[2].length - e3[3].length) };
  }, a2.sep = "/", a2.delimiter = ":", t2.exports = a2;
}, 647: (t2, e2) => {
  var n2 = Object.prototype.hasOwnProperty;
  function r2(t3) {
    try {
      return decodeURIComponent(t3.replace(/\+/g, " "));
    } catch (t4) {
      return null;
    }
  }
  function o2(t3) {
    try {
      return encodeURIComponent(t3);
    } catch (t4) {
      return null;
    }
  }
  e2.stringify = function(t3, e3) {
    e3 = e3 || "";
    var r3, i2, s2 = [];
    for (i2 in "string" != typeof e3 && (e3 = "?"), t3) if (n2.call(t3, i2)) {
      if ((r3 = t3[i2]) || null != r3 && !isNaN(r3) || (r3 = ""), i2 = o2(i2), r3 = o2(r3), null === i2 || null === r3) continue;
      s2.push(i2 + "=" + r3);
    }
    return s2.length ? e3 + s2.join("&") : "";
  }, e2.parse = function(t3) {
    for (var e3, n3 = /([^=?#&]+)=?([^&]*)/g, o3 = {}; e3 = n3.exec(t3); ) {
      var i2 = r2(e3[1]), s2 = r2(e3[2]);
      null === i2 || null === s2 || i2 in o3 || (o3[i2] = s2);
    }
    return o3;
  };
}, 670: (t2) => {
  t2.exports = function(t3, e2) {
    if (e2 = e2.split(":")[0], !(t3 = +t3)) return false;
    switch (e2) {
      case "http":
      case "ws":
        return 80 !== t3;
      case "https":
      case "wss":
        return 443 !== t3;
      case "ftp":
        return 21 !== t3;
      case "gopher":
        return 70 !== t3;
      case "file":
        return false;
    }
    return 0 !== t3;
  };
}, 494: (t2) => {
  const e2 = /^[-+]?0x[a-fA-F0-9]+$/, n2 = /^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;
  !Number.parseInt && window.parseInt && (Number.parseInt = window.parseInt), !Number.parseFloat && window.parseFloat && (Number.parseFloat = window.parseFloat);
  const r2 = { hex: true, leadingZeros: true, decimalPoint: ".", eNotation: true };
  t2.exports = function(t3) {
    let o2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (o2 = Object.assign({}, r2, o2), !t3 || "string" != typeof t3) return t3;
    let i2 = t3.trim();
    if (void 0 !== o2.skipLike && o2.skipLike.test(i2)) return t3;
    if (o2.hex && e2.test(i2)) return Number.parseInt(i2, 16);
    {
      const e3 = n2.exec(i2);
      if (e3) {
        const n3 = e3[1], r3 = e3[2];
        let a2 = (s2 = e3[3]) && -1 !== s2.indexOf(".") ? ("." === (s2 = s2.replace(/0+$/, "")) ? s2 = "0" : "." === s2[0] ? s2 = "0" + s2 : "." === s2[s2.length - 1] && (s2 = s2.substr(0, s2.length - 1)), s2) : s2;
        const u2 = e3[4] || e3[6];
        if (!o2.leadingZeros && r3.length > 0 && n3 && "." !== i2[2]) return t3;
        if (!o2.leadingZeros && r3.length > 0 && !n3 && "." !== i2[1]) return t3;
        {
          const e4 = Number(i2), s3 = "" + e4;
          return -1 !== s3.search(/[eE]/) || u2 ? o2.eNotation ? e4 : t3 : -1 !== i2.indexOf(".") ? "0" === s3 && "" === a2 || s3 === a2 || n3 && s3 === "-" + a2 ? e4 : t3 : r3 ? a2 === s3 || n3 + a2 === s3 ? e4 : t3 : i2 === s3 || i2 === n3 + s3 ? e4 : t3;
        }
      }
      return t3;
    }
    var s2;
  };
}, 737: (t2, e2, n2) => {
  var r2 = n2(670), o2 = n2(647), i2 = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/, s2 = /[\n\r\t]/g, a2 = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//, u2 = /:\d+$/, c2 = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i, l2 = /^[a-zA-Z]:/;
  function h2(t3) {
    return (t3 || "").toString().replace(i2, "");
  }
  var p2 = [["#", "hash"], ["?", "query"], function(t3, e3) {
    return g2(e3.protocol) ? t3.replace(/\\/g, "/") : t3;
  }, ["/", "pathname"], ["@", "auth", 1], [NaN, "host", void 0, 1, 1], [/:(\d*)$/, "port", void 0, 1], [NaN, "hostname", void 0, 1, 1]], f2 = { hash: 1, query: 1 };
  function d2(t3) {
    var e3, n3 = ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}).location || {}, r3 = {}, o3 = typeof (t3 = t3 || n3);
    if ("blob:" === t3.protocol) r3 = new y2(unescape(t3.pathname), {});
    else if ("string" === o3) for (e3 in r3 = new y2(t3, {}), f2) delete r3[e3];
    else if ("object" === o3) {
      for (e3 in t3) e3 in f2 || (r3[e3] = t3[e3]);
      void 0 === r3.slashes && (r3.slashes = a2.test(t3.href));
    }
    return r3;
  }
  function g2(t3) {
    return "file:" === t3 || "ftp:" === t3 || "http:" === t3 || "https:" === t3 || "ws:" === t3 || "wss:" === t3;
  }
  function m2(t3, e3) {
    t3 = (t3 = h2(t3)).replace(s2, ""), e3 = e3 || {};
    var n3, r3 = c2.exec(t3), o3 = r3[1] ? r3[1].toLowerCase() : "", i3 = !!r3[2], a3 = !!r3[3], u3 = 0;
    return i3 ? a3 ? (n3 = r3[2] + r3[3] + r3[4], u3 = r3[2].length + r3[3].length) : (n3 = r3[2] + r3[4], u3 = r3[2].length) : a3 ? (n3 = r3[3] + r3[4], u3 = r3[3].length) : n3 = r3[4], "file:" === o3 ? u3 >= 2 && (n3 = n3.slice(2)) : g2(o3) ? n3 = r3[4] : o3 ? i3 && (n3 = n3.slice(2)) : u3 >= 2 && g2(e3.protocol) && (n3 = r3[4]), { protocol: o3, slashes: i3 || g2(o3), slashesCount: u3, rest: n3 };
  }
  function y2(t3, e3, n3) {
    if (t3 = (t3 = h2(t3)).replace(s2, ""), !(this instanceof y2)) return new y2(t3, e3, n3);
    var i3, a3, u3, c3, f3, v2, b2 = p2.slice(), w2 = typeof e3, x2 = this, N2 = 0;
    for ("object" !== w2 && "string" !== w2 && (n3 = e3, e3 = null), n3 && "function" != typeof n3 && (n3 = o2.parse), i3 = !(a3 = m2(t3 || "", e3 = d2(e3))).protocol && !a3.slashes, x2.slashes = a3.slashes || i3 && e3.slashes, x2.protocol = a3.protocol || e3.protocol || "", t3 = a3.rest, ("file:" === a3.protocol && (2 !== a3.slashesCount || l2.test(t3)) || !a3.slashes && (a3.protocol || a3.slashesCount < 2 || !g2(x2.protocol))) && (b2[3] = [/(.*)/, "pathname"]); N2 < b2.length; N2++) "function" != typeof (c3 = b2[N2]) ? (u3 = c3[0], v2 = c3[1], u3 != u3 ? x2[v2] = t3 : "string" == typeof u3 ? ~(f3 = "@" === u3 ? t3.lastIndexOf(u3) : t3.indexOf(u3)) && ("number" == typeof c3[2] ? (x2[v2] = t3.slice(0, f3), t3 = t3.slice(f3 + c3[2])) : (x2[v2] = t3.slice(f3), t3 = t3.slice(0, f3))) : (f3 = u3.exec(t3)) && (x2[v2] = f3[1], t3 = t3.slice(0, f3.index)), x2[v2] = x2[v2] || i3 && c3[3] && e3[v2] || "", c3[4] && (x2[v2] = x2[v2].toLowerCase())) : t3 = c3(t3, x2);
    n3 && (x2.query = n3(x2.query)), i3 && e3.slashes && "/" !== x2.pathname.charAt(0) && ("" !== x2.pathname || "" !== e3.pathname) && (x2.pathname = (function(t4, e4) {
      if ("" === t4) return e4;
      for (var n4 = (e4 || "/").split("/").slice(0, -1).concat(t4.split("/")), r3 = n4.length, o3 = n4[r3 - 1], i4 = false, s3 = 0; r3--; ) "." === n4[r3] ? n4.splice(r3, 1) : ".." === n4[r3] ? (n4.splice(r3, 1), s3++) : s3 && (0 === r3 && (i4 = true), n4.splice(r3, 1), s3--);
      return i4 && n4.unshift(""), "." !== o3 && ".." !== o3 || n4.push(""), n4.join("/");
    })(x2.pathname, e3.pathname)), "/" !== x2.pathname.charAt(0) && g2(x2.protocol) && (x2.pathname = "/" + x2.pathname), r2(x2.port, x2.protocol) || (x2.host = x2.hostname, x2.port = ""), x2.username = x2.password = "", x2.auth && (~(f3 = x2.auth.indexOf(":")) ? (x2.username = x2.auth.slice(0, f3), x2.username = encodeURIComponent(decodeURIComponent(x2.username)), x2.password = x2.auth.slice(f3 + 1), x2.password = encodeURIComponent(decodeURIComponent(x2.password))) : x2.username = encodeURIComponent(decodeURIComponent(x2.auth)), x2.auth = x2.password ? x2.username + ":" + x2.password : x2.username), x2.origin = "file:" !== x2.protocol && g2(x2.protocol) && x2.host ? x2.protocol + "//" + x2.host : "null", x2.href = x2.toString();
  }
  y2.prototype = { set: function(t3, e3, n3) {
    var i3 = this;
    switch (t3) {
      case "query":
        "string" == typeof e3 && e3.length && (e3 = (n3 || o2.parse)(e3)), i3[t3] = e3;
        break;
      case "port":
        i3[t3] = e3, r2(e3, i3.protocol) ? e3 && (i3.host = i3.hostname + ":" + e3) : (i3.host = i3.hostname, i3[t3] = "");
        break;
      case "hostname":
        i3[t3] = e3, i3.port && (e3 += ":" + i3.port), i3.host = e3;
        break;
      case "host":
        i3[t3] = e3, u2.test(e3) ? (e3 = e3.split(":"), i3.port = e3.pop(), i3.hostname = e3.join(":")) : (i3.hostname = e3, i3.port = "");
        break;
      case "protocol":
        i3.protocol = e3.toLowerCase(), i3.slashes = !n3;
        break;
      case "pathname":
      case "hash":
        if (e3) {
          var s3 = "pathname" === t3 ? "/" : "#";
          i3[t3] = e3.charAt(0) !== s3 ? s3 + e3 : e3;
        } else i3[t3] = e3;
        break;
      case "username":
      case "password":
        i3[t3] = encodeURIComponent(e3);
        break;
      case "auth":
        var a3 = e3.indexOf(":");
        ~a3 ? (i3.username = e3.slice(0, a3), i3.username = encodeURIComponent(decodeURIComponent(i3.username)), i3.password = e3.slice(a3 + 1), i3.password = encodeURIComponent(decodeURIComponent(i3.password))) : i3.username = encodeURIComponent(decodeURIComponent(e3));
    }
    for (var c3 = 0; c3 < p2.length; c3++) {
      var l3 = p2[c3];
      l3[4] && (i3[l3[1]] = i3[l3[1]].toLowerCase());
    }
    return i3.auth = i3.password ? i3.username + ":" + i3.password : i3.username, i3.origin = "file:" !== i3.protocol && g2(i3.protocol) && i3.host ? i3.protocol + "//" + i3.host : "null", i3.href = i3.toString(), i3;
  }, toString: function(t3) {
    t3 && "function" == typeof t3 || (t3 = o2.stringify);
    var e3, n3 = this, r3 = n3.host, i3 = n3.protocol;
    i3 && ":" !== i3.charAt(i3.length - 1) && (i3 += ":");
    var s3 = i3 + (n3.protocol && n3.slashes || g2(n3.protocol) ? "//" : "");
    return n3.username ? (s3 += n3.username, n3.password && (s3 += ":" + n3.password), s3 += "@") : n3.password ? (s3 += ":" + n3.password, s3 += "@") : "file:" !== n3.protocol && g2(n3.protocol) && !r3 && "/" !== n3.pathname && (s3 += "@"), (":" === r3[r3.length - 1] || u2.test(n3.hostname) && !n3.port) && (r3 += ":"), s3 += r3 + n3.pathname, (e3 = "object" == typeof n3.query ? t3(n3.query) : n3.query) && (s3 += "?" !== e3.charAt(0) ? "?" + e3 : e3), n3.hash && (s3 += n3.hash), s3;
  } }, y2.extractProtocol = m2, y2.location = d2, y2.trimLeft = h2, y2.qs = o2, t2.exports = y2;
}, 410: () => {
}, 388: () => {
}, 805: () => {
}, 345: () => {
}, 800: () => {
} };
var e = {};
function n(r2) {
  var o2 = e[r2];
  if (void 0 !== o2) return o2.exports;
  var i2 = e[r2] = { id: r2, loaded: false, exports: {} };
  return t[r2].call(i2.exports, i2, i2.exports, n), i2.loaded = true, i2.exports;
}
n.n = (t2) => {
  var e2 = t2 && t2.__esModule ? () => t2.default : () => t2;
  return n.d(e2, { a: e2 }), e2;
}, n.d = (t2, e2) => {
  for (var r2 in e2) n.o(e2, r2) && !n.o(t2, r2) && Object.defineProperty(t2, r2, { enumerable: true, get: e2[r2] });
}, n.o = (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2), n.nmd = (t2) => (t2.paths = [], t2.children || (t2.children = []), t2);
var r = {};
n.d(r, { hT: () => C, O4: () => I, Kd: () => S, YK: () => $, UU: () => en, Gu: () => F, ky: () => oe, h4: () => ne, ch: () => re, hq: () => Xt, i5: () => ie });
var o = n(737);
var i = n.n(o);
function s(t2) {
  if (!a(t2)) throw new Error("Parameter was not an error");
}
function a(t2) {
  return !!t2 && "object" == typeof t2 && "[object Error]" === (e2 = t2, Object.prototype.toString.call(e2)) || t2 instanceof Error;
  var e2;
}
var u = class _u extends Error {
  constructor(t2, e2) {
    const n2 = [...arguments], { options: r2, shortMessage: o2 } = (function(t3) {
      let e3, n3 = "";
      if (0 === t3.length) e3 = {};
      else if (a(t3[0])) e3 = { cause: t3[0] }, n3 = t3.slice(1).join(" ") || "";
      else if (t3[0] && "object" == typeof t3[0]) e3 = Object.assign({}, t3[0]), n3 = t3.slice(1).join(" ") || "";
      else {
        if ("string" != typeof t3[0]) throw new Error("Invalid arguments passed to Layerr");
        e3 = {}, n3 = n3 = t3.join(" ") || "";
      }
      return { options: e3, shortMessage: n3 };
    })(n2);
    let i2 = o2;
    if (r2.cause && (i2 = `${i2}: ${r2.cause.message}`), super(i2), this.message = i2, r2.name && "string" == typeof r2.name ? this.name = r2.name : this.name = "Layerr", r2.cause && Object.defineProperty(this, "_cause", { value: r2.cause }), Object.defineProperty(this, "_info", { value: {} }), r2.info && "object" == typeof r2.info && Object.assign(this._info, r2.info), Error.captureStackTrace) {
      const t3 = r2.constructorOpt || this.constructor;
      Error.captureStackTrace(this, t3);
    }
  }
  static cause(t2) {
    return s(t2), t2._cause && a(t2._cause) ? t2._cause : null;
  }
  static fullStack(t2) {
    s(t2);
    const e2 = _u.cause(t2);
    return e2 ? `${t2.stack}
caused by: ${_u.fullStack(e2)}` : t2.stack ?? "";
  }
  static info(t2) {
    s(t2);
    const e2 = {}, n2 = _u.cause(t2);
    return n2 && Object.assign(e2, _u.info(n2)), t2._info && Object.assign(e2, t2._info), e2;
  }
  toString() {
    let t2 = this.name || this.constructor.name || this.constructor.prototype.name;
    return this.message && (t2 = `${t2}: ${this.message}`), t2;
  }
};
var c = n(47);
var l = n.n(c);
var h = "__PATH_SEPARATOR_POSIX__";
var p = "__PATH_SEPARATOR_WINDOWS__";
function f(t2) {
  try {
    const e2 = t2.replace(/\//g, h).replace(/\\\\/g, p);
    return encodeURIComponent(e2).split(p).join("\\\\").split(h).join("/");
  } catch (t3) {
    throw new u(t3, "Failed encoding path");
  }
}
function d(t2) {
  return t2.startsWith("/") ? t2 : "/" + t2;
}
function g(t2) {
  let e2 = t2;
  return "/" !== e2[0] && (e2 = "/" + e2), /^.+\/$/.test(e2) && (e2 = e2.substr(0, e2.length - 1)), e2;
}
function m(t2) {
  let e2 = new (i())(t2).pathname;
  return e2.length <= 0 && (e2 = "/"), g(e2);
}
function y() {
  for (var t2 = arguments.length, e2 = new Array(t2), n2 = 0; n2 < t2; n2++) e2[n2] = arguments[n2];
  return (function() {
    return (function(t3) {
      var e3 = [];
      if (0 === t3.length) return "";
      if ("string" != typeof t3[0]) throw new TypeError("Url must be a string. Received " + t3[0]);
      if (t3[0].match(/^[^/:]+:\/*$/) && t3.length > 1) {
        var n3 = t3.shift();
        t3[0] = n3 + t3[0];
      }
      t3[0].match(/^file:\/\/\//) ? t3[0] = t3[0].replace(/^([^/:]+):\/*/, "$1:///") : t3[0] = t3[0].replace(/^([^/:]+):\/*/, "$1://");
      for (var r2 = 0; r2 < t3.length; r2++) {
        var o2 = t3[r2];
        if ("string" != typeof o2) throw new TypeError("Url must be a string. Received " + o2);
        "" !== o2 && (r2 > 0 && (o2 = o2.replace(/^[\/]+/, "")), o2 = r2 < t3.length - 1 ? o2.replace(/[\/]+$/, "") : o2.replace(/[\/]+$/, "/"), e3.push(o2));
      }
      var i2 = e3.join("/"), s2 = (i2 = i2.replace(/\/(\?|&|#[^!])/g, "$1")).split("?");
      return s2.shift() + (s2.length > 0 ? "?" : "") + s2.join("&");
    })("object" == typeof arguments[0] ? arguments[0] : [].slice.call(arguments));
  })(e2.reduce(((t3, e3, n3) => ((0 === n3 || "/" !== e3 || "/" === e3 && "/" !== t3[t3.length - 1]) && t3.push(e3), t3)), []));
}
var v = n(542);
var b = n.n(v);
var w = "abcdef0123456789";
function x(t2, e2) {
  const n2 = t2.url.replace("//", ""), r2 = -1 == n2.indexOf("/") ? "/" : n2.slice(n2.indexOf("/")), o2 = t2.method ? t2.method.toUpperCase() : "GET", i2 = !!/(^|,)\s*auth\s*($|,)/.test(e2.qop) && "auth", s2 = `00000000${e2.nc}`.slice(-8), a2 = (function(t3, e3, n3, r3, o3, i3, s3) {
    const a3 = s3 || b()(`${e3}:${n3}:${r3}`);
    return t3 && "md5-sess" === t3.toLowerCase() ? b()(`${a3}:${o3}:${i3}`) : a3;
  })(e2.algorithm, e2.username, e2.realm, e2.password, e2.nonce, e2.cnonce, e2.ha1), u2 = b()(`${o2}:${r2}`), c2 = i2 ? b()(`${a2}:${e2.nonce}:${s2}:${e2.cnonce}:${i2}:${u2}`) : b()(`${a2}:${e2.nonce}:${u2}`), l2 = { username: e2.username, realm: e2.realm, nonce: e2.nonce, uri: r2, qop: i2, response: c2, nc: s2, cnonce: e2.cnonce, algorithm: e2.algorithm, opaque: e2.opaque }, h2 = [];
  for (const t3 in l2) l2[t3] && ("qop" === t3 || "nc" === t3 || "algorithm" === t3 ? h2.push(`${t3}=${l2[t3]}`) : h2.push(`${t3}="${l2[t3]}"`));
  return `Digest ${h2.join(", ")}`;
}
function N(t2) {
  return "digest" === (t2.headers && t2.headers.get("www-authenticate") || "").split(/\s/)[0].toLowerCase();
}
var A = n(101);
var P = n.n(A);
function O(t2) {
  return P().decode(t2);
}
function E(t2, e2) {
  var n2;
  return `Basic ${n2 = `${t2}:${e2}`, P().encode(n2)}`;
}
var T = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : "undefined" != typeof window ? window : globalThis;
var j = T.fetch.bind(T);
var S = (T.Headers, T.Request);
var $ = T.Response;
var C = (function(t2) {
  return t2.Auto = "auto", t2.Digest = "digest", t2.None = "none", t2.Password = "password", t2.Token = "token", t2;
})({});
var I = (function(t2) {
  return t2.DataTypeNoLength = "data-type-no-length", t2.InvalidAuthType = "invalid-auth-type", t2.InvalidOutputFormat = "invalid-output-format", t2.LinkUnsupportedAuthType = "link-unsupported-auth", t2.InvalidUpdateRange = "invalid-update-range", t2.NotSupported = "not-supported", t2;
})({});
function k(t2, e2, n2, r2, o2) {
  switch (t2.authType) {
    case C.Auto:
      e2 && n2 && (t2.headers.Authorization = E(e2, n2));
      break;
    case C.Digest:
      t2.digest = /* @__PURE__ */ (function(t3, e3, n3) {
        return { username: t3, password: e3, ha1: n3, nc: 0, algorithm: "md5", hasDigestAuth: false };
      })(e2, n2, o2);
      break;
    case C.None:
      break;
    case C.Password:
      t2.headers.Authorization = E(e2, n2);
      break;
    case C.Token:
      t2.headers.Authorization = `${(i2 = r2).token_type} ${i2.access_token}`;
      break;
    default:
      throw new u({ info: { code: I.InvalidAuthType } }, `Invalid auth type: ${t2.authType}`);
  }
  var i2;
}
n(345), n(800);
var R = "@@HOTPATCHER";
var L = () => {
};
function _(t2) {
  return { original: t2, methods: [t2], final: false };
}
var M = class {
  constructor() {
    this._configuration = { registry: {}, getEmptyAction: "null" }, this.__type__ = R;
  }
  get configuration() {
    return this._configuration;
  }
  get getEmptyAction() {
    return this.configuration.getEmptyAction;
  }
  set getEmptyAction(t2) {
    this.configuration.getEmptyAction = t2;
  }
  control(t2) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    if (!t2 || t2.__type__ !== R) throw new Error("Failed taking control of target HotPatcher instance: Invalid type or object");
    return Object.keys(t2.configuration.registry).forEach(((n2) => {
      this.configuration.registry.hasOwnProperty(n2) ? e2 && (this.configuration.registry[n2] = Object.assign({}, t2.configuration.registry[n2])) : this.configuration.registry[n2] = Object.assign({}, t2.configuration.registry[n2]);
    })), t2._configuration = this.configuration, this;
  }
  execute(t2) {
    const e2 = this.get(t2) || L;
    for (var n2 = arguments.length, r2 = new Array(n2 > 1 ? n2 - 1 : 0), o2 = 1; o2 < n2; o2++) r2[o2 - 1] = arguments[o2];
    return e2(...r2);
  }
  get(t2) {
    const e2 = this.configuration.registry[t2];
    if (!e2) switch (this.getEmptyAction) {
      case "null":
        return null;
      case "throw":
        throw new Error(`Failed handling method request: No method provided for override: ${t2}`);
      default:
        throw new Error(`Failed handling request which resulted in an empty method: Invalid empty-action specified: ${this.getEmptyAction}`);
    }
    return (function() {
      for (var t3 = arguments.length, e3 = new Array(t3), n2 = 0; n2 < t3; n2++) e3[n2] = arguments[n2];
      if (0 === e3.length) throw new Error("Failed creating sequence: No functions provided");
      return function() {
        for (var t4 = arguments.length, n3 = new Array(t4), r2 = 0; r2 < t4; r2++) n3[r2] = arguments[r2];
        let o2 = n3;
        const i2 = this;
        for (; e3.length > 0; ) o2 = [e3.shift().apply(i2, o2)];
        return o2[0];
      };
    })(...e2.methods);
  }
  isPatched(t2) {
    return !!this.configuration.registry[t2];
  }
  patch(t2, e2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    const { chain: r2 = false } = n2;
    if (this.configuration.registry[t2] && this.configuration.registry[t2].final) throw new Error(`Failed patching '${t2}': Method marked as being final`);
    if ("function" != typeof e2) throw new Error(`Failed patching '${t2}': Provided method is not a function`);
    if (r2) this.configuration.registry[t2] ? this.configuration.registry[t2].methods.push(e2) : this.configuration.registry[t2] = _(e2);
    else if (this.isPatched(t2)) {
      const { original: n3 } = this.configuration.registry[t2];
      this.configuration.registry[t2] = Object.assign(_(e2), { original: n3 });
    } else this.configuration.registry[t2] = _(e2);
    return this;
  }
  patchInline(t2, e2) {
    this.isPatched(t2) || this.patch(t2, e2);
    for (var n2 = arguments.length, r2 = new Array(n2 > 2 ? n2 - 2 : 0), o2 = 2; o2 < n2; o2++) r2[o2 - 2] = arguments[o2];
    return this.execute(t2, ...r2);
  }
  plugin(t2) {
    for (var e2 = arguments.length, n2 = new Array(e2 > 1 ? e2 - 1 : 0), r2 = 1; r2 < e2; r2++) n2[r2 - 1] = arguments[r2];
    return n2.forEach(((e3) => {
      this.patch(t2, e3, { chain: true });
    })), this;
  }
  restore(t2) {
    if (!this.isPatched(t2)) throw new Error(`Failed restoring method: No method present for key: ${t2}`);
    if ("function" != typeof this.configuration.registry[t2].original) throw new Error(`Failed restoring method: Original method not found or of invalid type for key: ${t2}`);
    return this.configuration.registry[t2].methods = [this.configuration.registry[t2].original], this;
  }
  setFinal(t2) {
    if (!this.configuration.registry.hasOwnProperty(t2)) throw new Error(`Failed marking '${t2}' as final: No method found for key`);
    return this.configuration.registry[t2].final = true, this;
  }
};
var U = null;
function F() {
  return U || (U = new M()), U;
}
function D(t2) {
  return (function(t3) {
    if ("object" != typeof t3 || null === t3 || "[object Object]" != Object.prototype.toString.call(t3)) return false;
    if (null === Object.getPrototypeOf(t3)) return true;
    let e2 = t3;
    for (; null !== Object.getPrototypeOf(e2); ) e2 = Object.getPrototypeOf(e2);
    return Object.getPrototypeOf(t3) === e2;
  })(t2) ? Object.assign({}, t2) : Object.setPrototypeOf(Object.assign({}, t2), Object.getPrototypeOf(t2));
}
function B() {
  for (var t2 = arguments.length, e2 = new Array(t2), n2 = 0; n2 < t2; n2++) e2[n2] = arguments[n2];
  let r2 = null, o2 = [...e2];
  for (; o2.length > 0; ) {
    const t3 = o2.shift();
    r2 = r2 ? V(r2, t3) : D(t3);
  }
  return r2;
}
function V(t2, e2) {
  const n2 = D(t2);
  return Object.keys(e2).forEach(((t3) => {
    n2.hasOwnProperty(t3) ? Array.isArray(e2[t3]) ? n2[t3] = Array.isArray(n2[t3]) ? [...n2[t3], ...e2[t3]] : [...e2[t3]] : "object" == typeof e2[t3] && e2[t3] ? n2[t3] = "object" == typeof n2[t3] && n2[t3] ? V(n2[t3], e2[t3]) : D(e2[t3]) : n2[t3] = e2[t3] : n2[t3] = e2[t3];
  })), n2;
}
function W(t2) {
  const e2 = {};
  for (const n2 of t2.keys()) e2[n2] = t2.get(n2);
  return e2;
}
function z() {
  for (var t2 = arguments.length, e2 = new Array(t2), n2 = 0; n2 < t2; n2++) e2[n2] = arguments[n2];
  if (0 === e2.length) return {};
  const r2 = {};
  return e2.reduce(((t3, e3) => (Object.keys(e3).forEach(((n3) => {
    const o2 = n3.toLowerCase();
    r2.hasOwnProperty(o2) ? t3[r2[o2]] = e3[n3] : (r2[o2] = n3, t3[n3] = e3[n3]);
  })), t3)), {});
}
n(805);
var G = "function" == typeof ArrayBuffer;
var { toString: q } = Object.prototype;
function H(t2) {
  return G && (t2 instanceof ArrayBuffer || "[object ArrayBuffer]" === q.call(t2));
}
function X(t2) {
  return null != t2 && null != t2.constructor && "function" == typeof t2.constructor.isBuffer && t2.constructor.isBuffer(t2);
}
function Z(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
}
function Y(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var K = Z((function(t2) {
  const e2 = t2._digest;
  return delete t2._digest, e2.hasDigestAuth && (t2 = B(t2, { headers: { Authorization: x(t2, e2) } })), Y(et(t2), (function(n2) {
    let r2 = false;
    return o2 = function(t3) {
      return r2 ? t3 : n2;
    }, (i2 = (function() {
      if (401 == n2.status) return e2.hasDigestAuth = (function(t3, e3) {
        if (!N(t3)) return false;
        const n3 = /([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi;
        for (; ; ) {
          const r3 = t3.headers && t3.headers.get("www-authenticate") || "", o3 = n3.exec(r3);
          if (!o3) break;
          e3[o3[1]] = o3[2] || o3[3];
        }
        return e3.nc += 1, e3.cnonce = (function() {
          let t4 = "";
          for (let e4 = 0; e4 < 32; ++e4) t4 = `${t4}${w[Math.floor(16 * Math.random())]}`;
          return t4;
        })(), true;
      })(n2, e2), (function() {
        if (e2.hasDigestAuth) return Y(et(t2 = B(t2, { headers: { Authorization: x(t2, e2) } })), (function(t3) {
          return 401 == t3.status ? e2.hasDigestAuth = false : e2.nc++, r2 = true, t3;
        }));
      })();
      e2.nc++;
    })()) && i2.then ? i2.then(o2) : o2(i2);
    var o2, i2;
  }));
}));
var J = Z((function(t2, e2) {
  return Y(et(t2), (function(n2) {
    return n2.ok ? (e2.authType = C.Password, n2) : 401 == n2.status && N(n2) ? (e2.authType = C.Digest, k(e2, e2.username, e2.password, void 0, void 0), t2._digest = e2.digest, K(t2)) : n2;
  }));
}));
var Q = Z((function(t2, e2) {
  return e2.authType === C.Auto ? J(t2, e2) : t2._digest ? K(t2) : et(t2);
}));
function tt(t2, e2, n2) {
  const r2 = D(t2);
  return r2.headers = z(e2.headers, r2.headers || {}, n2.headers || {}), void 0 !== n2.data && (r2.data = n2.data), n2.signal && (r2.signal = n2.signal), e2.httpAgent && (r2.httpAgent = e2.httpAgent), e2.httpsAgent && (r2.httpsAgent = e2.httpsAgent), e2.digest && (r2._digest = e2.digest), "boolean" == typeof e2.withCredentials && (r2.withCredentials = e2.withCredentials), r2;
}
function et(t2) {
  const e2 = F();
  return e2.patchInline("request", ((t3) => e2.patchInline("fetch", j, t3.url, (function(t4) {
    let e3 = {};
    const n2 = { method: t4.method };
    if (t4.headers && (e3 = z(e3, t4.headers)), void 0 !== t4.data) {
      const [r2, o2] = (function(t5) {
        if ("string" == typeof t5) return [t5, {}];
        if (X(t5)) return [t5, {}];
        if (H(t5)) return [t5, {}];
        if (t5 && "object" == typeof t5) return [JSON.stringify(t5), { "content-type": "application/json" }];
        throw new Error("Unable to convert request body: Unexpected body type: " + typeof t5);
      })(t4.data);
      n2.body = r2, e3 = z(e3, o2);
    }
    return t4.signal && (n2.signal = t4.signal), t4.withCredentials && (n2.credentials = "include"), n2.headers = e3, n2;
  })(t3))), t2);
}
var nt = n(285);
var rt = (t2) => {
  if ("string" != typeof t2) throw new TypeError("invalid pattern");
  if (t2.length > 65536) throw new TypeError("pattern is too long");
};
var ot = { "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true], "[:alpha:]": ["\\p{L}\\p{Nl}", true], "[:ascii:]": ["\\x00-\\x7f", false], "[:blank:]": ["\\p{Zs}\\t", true], "[:cntrl:]": ["\\p{Cc}", true], "[:digit:]": ["\\p{Nd}", true], "[:graph:]": ["\\p{Z}\\p{C}", true, true], "[:lower:]": ["\\p{Ll}", true], "[:print:]": ["\\p{C}", true], "[:punct:]": ["\\p{P}", true], "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true], "[:upper:]": ["\\p{Lu}", true], "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true], "[:xdigit:]": ["A-Fa-f0-9", false] };
var it = (t2) => t2.replace(/[[\]\\-]/g, "\\$&");
var st = (t2) => t2.join("");
var at = (t2, e2) => {
  const n2 = e2;
  if ("[" !== t2.charAt(n2)) throw new Error("not in a brace expression");
  const r2 = [], o2 = [];
  let i2 = n2 + 1, s2 = false, a2 = false, u2 = false, c2 = false, l2 = n2, h2 = "";
  t: for (; i2 < t2.length; ) {
    const e3 = t2.charAt(i2);
    if ("!" !== e3 && "^" !== e3 || i2 !== n2 + 1) {
      if ("]" === e3 && s2 && !u2) {
        l2 = i2 + 1;
        break;
      }
      if (s2 = true, "\\" !== e3 || u2) {
        if ("[" === e3 && !u2) {
          for (const [e4, [s3, u3, c3]] of Object.entries(ot)) if (t2.startsWith(e4, i2)) {
            if (h2) return ["$.", false, t2.length - n2, true];
            i2 += e4.length, c3 ? o2.push(s3) : r2.push(s3), a2 = a2 || u3;
            continue t;
          }
        }
        u2 = false, h2 ? (e3 > h2 ? r2.push(it(h2) + "-" + it(e3)) : e3 === h2 && r2.push(it(e3)), h2 = "", i2++) : t2.startsWith("-]", i2 + 1) ? (r2.push(it(e3 + "-")), i2 += 2) : t2.startsWith("-", i2 + 1) ? (h2 = e3, i2 += 2) : (r2.push(it(e3)), i2++);
      } else u2 = true, i2++;
    } else c2 = true, i2++;
  }
  if (l2 < i2) return ["", false, 0, false];
  if (!r2.length && !o2.length) return ["$.", false, t2.length - n2, true];
  if (0 === o2.length && 1 === r2.length && /^\\?.$/.test(r2[0]) && !c2) {
    return [(p2 = 2 === r2[0].length ? r2[0].slice(-1) : r2[0], p2.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")), false, l2 - n2, false];
  }
  var p2;
  const f2 = "[" + (c2 ? "^" : "") + st(r2) + "]", d2 = "[" + (c2 ? "" : "^") + st(o2) + "]";
  return [r2.length && o2.length ? "(" + f2 + "|" + d2 + ")" : r2.length ? f2 : d2, a2, l2 - n2, true];
};
var ut = function(t2) {
  let { windowsPathsNoEscape: e2 = false } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return e2 ? t2.replace(/\[([^\/\\])\]/g, "$1") : t2.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
};
var ct = /* @__PURE__ */ new Set(["!", "?", "+", "*", "@"]);
var lt = (t2) => ct.has(t2);
var ht = "(?!\\.)";
var pt = /* @__PURE__ */ new Set(["[", "."]);
var ft = /* @__PURE__ */ new Set(["..", "."]);
var dt = new Set("().*{}+?[]^$\\!");
var gt = "[^/]";
var mt = gt + "*?";
var yt = gt + "+?";
var vt = class _vt {
  type;
  #t;
  #e;
  #n = false;
  #r = [];
  #o;
  #i;
  #s;
  #a = false;
  #u;
  #c;
  #l = false;
  constructor(t2, e2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    this.type = t2, t2 && (this.#e = true), this.#o = e2, this.#t = this.#o ? this.#o.#t : this, this.#u = this.#t === this ? n2 : this.#t.#u, this.#s = this.#t === this ? [] : this.#t.#s, "!" !== t2 || this.#t.#a || this.#s.push(this), this.#i = this.#o ? this.#o.#r.length : 0;
  }
  get hasMagic() {
    if (void 0 !== this.#e) return this.#e;
    for (const t2 of this.#r) if ("string" != typeof t2 && (t2.type || t2.hasMagic)) return this.#e = true;
    return this.#e;
  }
  toString() {
    return void 0 !== this.#c ? this.#c : this.type ? this.#c = this.type + "(" + this.#r.map(((t2) => String(t2))).join("|") + ")" : this.#c = this.#r.map(((t2) => String(t2))).join("");
  }
  #h() {
    if (this !== this.#t) throw new Error("should only call on root");
    if (this.#a) return this;
    let t2;
    for (this.toString(), this.#a = true; t2 = this.#s.pop(); ) {
      if ("!" !== t2.type) continue;
      let e2 = t2, n2 = e2.#o;
      for (; n2; ) {
        for (let r2 = e2.#i + 1; !n2.type && r2 < n2.#r.length; r2++) for (const e3 of t2.#r) {
          if ("string" == typeof e3) throw new Error("string part in extglob AST??");
          e3.copyIn(n2.#r[r2]);
        }
        e2 = n2, n2 = e2.#o;
      }
    }
    return this;
  }
  push() {
    for (var t2 = arguments.length, e2 = new Array(t2), n2 = 0; n2 < t2; n2++) e2[n2] = arguments[n2];
    for (const t3 of e2) if ("" !== t3) {
      if ("string" != typeof t3 && !(t3 instanceof _vt && t3.#o === this)) throw new Error("invalid part: " + t3);
      this.#r.push(t3);
    }
  }
  toJSON() {
    const t2 = null === this.type ? this.#r.slice().map(((t3) => "string" == typeof t3 ? t3 : t3.toJSON())) : [this.type, ...this.#r.map(((t3) => t3.toJSON()))];
    return this.isStart() && !this.type && t2.unshift([]), this.isEnd() && (this === this.#t || this.#t.#a && "!" === this.#o?.type) && t2.push({}), t2;
  }
  isStart() {
    if (this.#t === this) return true;
    if (!this.#o?.isStart()) return false;
    if (0 === this.#i) return true;
    const t2 = this.#o;
    for (let e2 = 0; e2 < this.#i; e2++) {
      const n2 = t2.#r[e2];
      if (!(n2 instanceof _vt && "!" === n2.type)) return false;
    }
    return true;
  }
  isEnd() {
    if (this.#t === this) return true;
    if ("!" === this.#o?.type) return true;
    if (!this.#o?.isEnd()) return false;
    if (!this.type) return this.#o?.isEnd();
    const t2 = this.#o ? this.#o.#r.length : 0;
    return this.#i === t2 - 1;
  }
  copyIn(t2) {
    "string" == typeof t2 ? this.push(t2) : this.push(t2.clone(this));
  }
  clone(t2) {
    const e2 = new _vt(this.type, t2);
    for (const t3 of this.#r) e2.copyIn(t3);
    return e2;
  }
  static #p(t2, e2, n2, r2) {
    let o2 = false, i2 = false, s2 = -1, a2 = false;
    if (null === e2.type) {
      let u3 = n2, c3 = "";
      for (; u3 < t2.length; ) {
        const n3 = t2.charAt(u3++);
        if (o2 || "\\" === n3) o2 = !o2, c3 += n3;
        else if (i2) u3 === s2 + 1 ? "^" !== n3 && "!" !== n3 || (a2 = true) : "]" !== n3 || u3 === s2 + 2 && a2 || (i2 = false), c3 += n3;
        else if ("[" !== n3) if (r2.noext || !lt(n3) || "(" !== t2.charAt(u3)) c3 += n3;
        else {
          e2.push(c3), c3 = "";
          const o3 = new _vt(n3, e2);
          u3 = _vt.#p(t2, o3, u3, r2), e2.push(o3);
        }
        else i2 = true, s2 = u3, a2 = false, c3 += n3;
      }
      return e2.push(c3), u3;
    }
    let u2 = n2 + 1, c2 = new _vt(null, e2);
    const l2 = [];
    let h2 = "";
    for (; u2 < t2.length; ) {
      const n3 = t2.charAt(u2++);
      if (o2 || "\\" === n3) o2 = !o2, h2 += n3;
      else if (i2) u2 === s2 + 1 ? "^" !== n3 && "!" !== n3 || (a2 = true) : "]" !== n3 || u2 === s2 + 2 && a2 || (i2 = false), h2 += n3;
      else if ("[" !== n3) if (lt(n3) && "(" === t2.charAt(u2)) {
        c2.push(h2), h2 = "";
        const e3 = new _vt(n3, c2);
        c2.push(e3), u2 = _vt.#p(t2, e3, u2, r2);
      } else if ("|" !== n3) {
        if (")" === n3) return "" === h2 && 0 === e2.#r.length && (e2.#l = true), c2.push(h2), h2 = "", e2.push(...l2, c2), u2;
        h2 += n3;
      } else c2.push(h2), h2 = "", l2.push(c2), c2 = new _vt(null, e2);
      else i2 = true, s2 = u2, a2 = false, h2 += n3;
    }
    return e2.type = null, e2.#e = void 0, e2.#r = [t2.substring(n2 - 1)], u2;
  }
  static fromGlob(t2) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const n2 = new _vt(null, void 0, e2);
    return _vt.#p(t2, n2, 0, e2), n2;
  }
  toMMPattern() {
    if (this !== this.#t) return this.#t.toMMPattern();
    const t2 = this.toString(), [e2, n2, r2, o2] = this.toRegExpSource();
    if (!(r2 || this.#e || this.#u.nocase && !this.#u.nocaseMagicOnly && t2.toUpperCase() !== t2.toLowerCase())) return n2;
    const i2 = (this.#u.nocase ? "i" : "") + (o2 ? "u" : "");
    return Object.assign(new RegExp(`^${e2}$`, i2), { _src: e2, _glob: t2 });
  }
  get options() {
    return this.#u;
  }
  toRegExpSource(t2) {
    const e2 = t2 ?? !!this.#u.dot;
    if (this.#t === this && this.#h(), !this.type) {
      const n3 = this.isStart() && this.isEnd(), r3 = this.#r.map(((e3) => {
        const [r4, o4, i4, s3] = "string" == typeof e3 ? _vt.#f(e3, this.#e, n3) : e3.toRegExpSource(t2);
        return this.#e = this.#e || i4, this.#n = this.#n || s3, r4;
      })).join("");
      let o3 = "";
      if (this.isStart() && "string" == typeof this.#r[0] && (1 !== this.#r.length || !ft.has(this.#r[0]))) {
        const n4 = pt, i4 = e2 && n4.has(r3.charAt(0)) || r3.startsWith("\\.") && n4.has(r3.charAt(2)) || r3.startsWith("\\.\\.") && n4.has(r3.charAt(4)), s3 = !e2 && !t2 && n4.has(r3.charAt(0));
        o3 = i4 ? "(?!(?:^|/)\\.\\.?(?:$|/))" : s3 ? ht : "";
      }
      let i3 = "";
      return this.isEnd() && this.#t.#a && "!" === this.#o?.type && (i3 = "(?:$|\\/)"), [o3 + r3 + i3, ut(r3), this.#e = !!this.#e, this.#n];
    }
    const n2 = "*" === this.type || "+" === this.type, r2 = "!" === this.type ? "(?:(?!(?:" : "(?:";
    let o2 = this.#d(e2);
    if (this.isStart() && this.isEnd() && !o2 && "!" !== this.type) {
      const t3 = this.toString();
      return this.#r = [t3], this.type = null, this.#e = void 0, [t3, ut(this.toString()), false, false];
    }
    let i2 = !n2 || t2 || e2 ? "" : this.#d(true);
    i2 === o2 && (i2 = ""), i2 && (o2 = `(?:${o2})(?:${i2})*?`);
    let s2 = "";
    return s2 = "!" === this.type && this.#l ? (this.isStart() && !e2 ? ht : "") + yt : r2 + o2 + ("!" === this.type ? "))" + (!this.isStart() || e2 || t2 ? "" : ht) + mt + ")" : "@" === this.type ? ")" : "?" === this.type ? ")?" : "+" === this.type && i2 ? ")" : "*" === this.type && i2 ? ")?" : `)${this.type}`), [s2, ut(o2), this.#e = !!this.#e, this.#n];
  }
  #d(t2) {
    return this.#r.map(((e2) => {
      if ("string" == typeof e2) throw new Error("string type in extglob ast??");
      const [n2, r2, o2, i2] = e2.toRegExpSource(t2);
      return this.#n = this.#n || i2, n2;
    })).filter(((t3) => !(this.isStart() && this.isEnd() && !t3))).join("|");
  }
  static #f(t2, e2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], r2 = false, o2 = "", i2 = false;
    for (let s2 = 0; s2 < t2.length; s2++) {
      const a2 = t2.charAt(s2);
      if (r2) r2 = false, o2 += (dt.has(a2) ? "\\" : "") + a2;
      else if ("\\" !== a2) {
        if ("[" === a2) {
          const [n3, r3, a3, u2] = at(t2, s2);
          if (a3) {
            o2 += n3, i2 = i2 || r3, s2 += a3 - 1, e2 = e2 || u2;
            continue;
          }
        }
        "*" !== a2 ? "?" !== a2 ? o2 += a2.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : (o2 += gt, e2 = true) : (o2 += n2 && "*" === t2 ? yt : mt, e2 = true);
      } else s2 === t2.length - 1 ? o2 += "\\\\" : r2 = true;
    }
    return [o2, ut(t2), !!e2, i2];
  }
};
var bt = function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  return rt(e2), !(!n2.nocomment && "#" === e2.charAt(0)) && new Gt(e2, n2).match(t2);
};
var wt = /^\*+([^+@!?\*\[\(]*)$/;
var xt = (t2) => (e2) => !e2.startsWith(".") && e2.endsWith(t2);
var Nt = (t2) => (e2) => e2.endsWith(t2);
var At = (t2) => (t2 = t2.toLowerCase(), (e2) => !e2.startsWith(".") && e2.toLowerCase().endsWith(t2));
var Pt = (t2) => (t2 = t2.toLowerCase(), (e2) => e2.toLowerCase().endsWith(t2));
var Ot = /^\*+\.\*+$/;
var Et = (t2) => !t2.startsWith(".") && t2.includes(".");
var Tt = (t2) => "." !== t2 && ".." !== t2 && t2.includes(".");
var jt = /^\.\*+$/;
var St = (t2) => "." !== t2 && ".." !== t2 && t2.startsWith(".");
var $t = /^\*+$/;
var Ct = (t2) => 0 !== t2.length && !t2.startsWith(".");
var It = (t2) => 0 !== t2.length && "." !== t2 && ".." !== t2;
var kt = /^\?+([^+@!?\*\[\(]*)?$/;
var Rt = (t2) => {
  let [e2, n2 = ""] = t2;
  const r2 = Ut([e2]);
  return n2 ? (n2 = n2.toLowerCase(), (t3) => r2(t3) && t3.toLowerCase().endsWith(n2)) : r2;
};
var Lt = (t2) => {
  let [e2, n2 = ""] = t2;
  const r2 = Ft([e2]);
  return n2 ? (n2 = n2.toLowerCase(), (t3) => r2(t3) && t3.toLowerCase().endsWith(n2)) : r2;
};
var _t = (t2) => {
  let [e2, n2 = ""] = t2;
  const r2 = Ft([e2]);
  return n2 ? (t3) => r2(t3) && t3.endsWith(n2) : r2;
};
var Mt = (t2) => {
  let [e2, n2 = ""] = t2;
  const r2 = Ut([e2]);
  return n2 ? (t3) => r2(t3) && t3.endsWith(n2) : r2;
};
var Ut = (t2) => {
  let [e2] = t2;
  const n2 = e2.length;
  return (t3) => t3.length === n2 && !t3.startsWith(".");
};
var Ft = (t2) => {
  let [e2] = t2;
  const n2 = e2.length;
  return (t3) => t3.length === n2 && "." !== t3 && ".." !== t3;
};
var Dt = "object" == typeof process && process ? "object" == typeof process.env && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
bt.sep = "win32" === Dt ? "\\" : "/";
var Bt = Symbol("globstar **");
bt.GLOBSTAR = Bt, bt.filter = function(t2) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return (n2) => bt(n2, t2, e2);
};
var Vt = function(t2) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return Object.assign({}, t2, e2);
};
bt.defaults = (t2) => {
  if (!t2 || "object" != typeof t2 || !Object.keys(t2).length) return bt;
  const e2 = bt;
  return Object.assign((function(n2, r2) {
    return e2(n2, r2, Vt(t2, arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}));
  }), { Minimatch: class extends e2.Minimatch {
    constructor(e3) {
      super(e3, Vt(t2, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}));
    }
    static defaults(n2) {
      return e2.defaults(Vt(t2, n2)).Minimatch;
    }
  }, AST: class extends e2.AST {
    constructor(e3, n2) {
      super(e3, n2, Vt(t2, arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}));
    }
    static fromGlob(n2) {
      let r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      return e2.AST.fromGlob(n2, Vt(t2, r2));
    }
  }, unescape: function(n2) {
    let r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return e2.unescape(n2, Vt(t2, r2));
  }, escape: function(n2) {
    let r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return e2.escape(n2, Vt(t2, r2));
  }, filter: function(n2) {
    let r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return e2.filter(n2, Vt(t2, r2));
  }, defaults: (n2) => e2.defaults(Vt(t2, n2)), makeRe: function(n2) {
    let r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return e2.makeRe(n2, Vt(t2, r2));
  }, braceExpand: function(n2) {
    let r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return e2.braceExpand(n2, Vt(t2, r2));
  }, match: function(n2, r2) {
    let o2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    return e2.match(n2, r2, Vt(t2, o2));
  }, sep: e2.sep, GLOBSTAR: Bt });
};
var Wt = function(t2) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return rt(t2), e2.nobrace || !/\{(?:(?!\{).)*\}/.test(t2) ? [t2] : nt(t2);
};
bt.braceExpand = Wt, bt.makeRe = function(t2) {
  return new Gt(t2, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}).makeRe();
}, bt.match = function(t2, e2) {
  const n2 = new Gt(e2, arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {});
  return t2 = t2.filter(((t3) => n2.match(t3))), n2.options.nonull && !t2.length && t2.push(e2), t2;
};
var zt = /[?*]|[+@!]\(.*?\)|\[|\]/;
var Gt = class {
  options;
  set;
  pattern;
  windowsPathsNoEscape;
  nonegate;
  negate;
  comment;
  empty;
  preserveMultipleSlashes;
  partial;
  globSet;
  globParts;
  nocase;
  isWindows;
  platform;
  windowsNoMagicRoot;
  regexp;
  constructor(t2) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    rt(t2), e2 = e2 || {}, this.options = e2, this.pattern = t2, this.platform = e2.platform || Dt, this.isWindows = "win32" === this.platform, this.windowsPathsNoEscape = !!e2.windowsPathsNoEscape || false === e2.allowWindowsEscape, this.windowsPathsNoEscape && (this.pattern = this.pattern.replace(/\\/g, "/")), this.preserveMultipleSlashes = !!e2.preserveMultipleSlashes, this.regexp = null, this.negate = false, this.nonegate = !!e2.nonegate, this.comment = false, this.empty = false, this.partial = !!e2.partial, this.nocase = !!this.options.nocase, this.windowsNoMagicRoot = void 0 !== e2.windowsNoMagicRoot ? e2.windowsNoMagicRoot : !(!this.isWindows || !this.nocase), this.globSet = [], this.globParts = [], this.set = [], this.make();
  }
  hasMagic() {
    if (this.options.magicalBraces && this.set.length > 1) return true;
    for (const t2 of this.set) for (const e2 of t2) if ("string" != typeof e2) return true;
    return false;
  }
  debug() {
  }
  make() {
    const t2 = this.pattern, e2 = this.options;
    if (!e2.nocomment && "#" === t2.charAt(0)) return void (this.comment = true);
    if (!t2) return void (this.empty = true);
    this.parseNegate(), this.globSet = [...new Set(this.braceExpand())], e2.debug && (this.debug = function() {
      return console.error(...arguments);
    }), this.debug(this.pattern, this.globSet);
    const n2 = this.globSet.map(((t3) => this.slashSplit(t3)));
    this.globParts = this.preprocess(n2), this.debug(this.pattern, this.globParts);
    let r2 = this.globParts.map(((t3, e3, n3) => {
      if (this.isWindows && this.windowsNoMagicRoot) {
        const e4 = !("" !== t3[0] || "" !== t3[1] || "?" !== t3[2] && zt.test(t3[2]) || zt.test(t3[3])), n4 = /^[a-z]:/i.test(t3[0]);
        if (e4) return [...t3.slice(0, 4), ...t3.slice(4).map(((t4) => this.parse(t4)))];
        if (n4) return [t3[0], ...t3.slice(1).map(((t4) => this.parse(t4)))];
      }
      return t3.map(((t4) => this.parse(t4)));
    }));
    if (this.debug(this.pattern, r2), this.set = r2.filter(((t3) => -1 === t3.indexOf(false))), this.isWindows) for (let t3 = 0; t3 < this.set.length; t3++) {
      const e3 = this.set[t3];
      "" === e3[0] && "" === e3[1] && "?" === this.globParts[t3][2] && "string" == typeof e3[3] && /^[a-z]:$/i.test(e3[3]) && (e3[2] = "?");
    }
    this.debug(this.pattern, this.set);
  }
  preprocess(t2) {
    if (this.options.noglobstar) for (let e3 = 0; e3 < t2.length; e3++) for (let n2 = 0; n2 < t2[e3].length; n2++) "**" === t2[e3][n2] && (t2[e3][n2] = "*");
    const { optimizationLevel: e2 = 1 } = this.options;
    return e2 >= 2 ? (t2 = this.firstPhasePreProcess(t2), t2 = this.secondPhasePreProcess(t2)) : t2 = e2 >= 1 ? this.levelOneOptimize(t2) : this.adjascentGlobstarOptimize(t2), t2;
  }
  adjascentGlobstarOptimize(t2) {
    return t2.map(((t3) => {
      let e2 = -1;
      for (; -1 !== (e2 = t3.indexOf("**", e2 + 1)); ) {
        let n2 = e2;
        for (; "**" === t3[n2 + 1]; ) n2++;
        n2 !== e2 && t3.splice(e2, n2 - e2);
      }
      return t3;
    }));
  }
  levelOneOptimize(t2) {
    return t2.map(((t3) => 0 === (t3 = t3.reduce(((t4, e2) => {
      const n2 = t4[t4.length - 1];
      return "**" === e2 && "**" === n2 ? t4 : ".." === e2 && n2 && ".." !== n2 && "." !== n2 && "**" !== n2 ? (t4.pop(), t4) : (t4.push(e2), t4);
    }), [])).length ? [""] : t3));
  }
  levelTwoFileOptimize(t2) {
    Array.isArray(t2) || (t2 = this.slashSplit(t2));
    let e2 = false;
    do {
      if (e2 = false, !this.preserveMultipleSlashes) {
        for (let n3 = 1; n3 < t2.length - 1; n3++) {
          const r2 = t2[n3];
          1 === n3 && "" === r2 && "" === t2[0] || "." !== r2 && "" !== r2 || (e2 = true, t2.splice(n3, 1), n3--);
        }
        "." !== t2[0] || 2 !== t2.length || "." !== t2[1] && "" !== t2[1] || (e2 = true, t2.pop());
      }
      let n2 = 0;
      for (; -1 !== (n2 = t2.indexOf("..", n2 + 1)); ) {
        const r2 = t2[n2 - 1];
        r2 && "." !== r2 && ".." !== r2 && "**" !== r2 && (e2 = true, t2.splice(n2 - 1, 2), n2 -= 2);
      }
    } while (e2);
    return 0 === t2.length ? [""] : t2;
  }
  firstPhasePreProcess(t2) {
    let e2 = false;
    do {
      e2 = false;
      for (let n2 of t2) {
        let r2 = -1;
        for (; -1 !== (r2 = n2.indexOf("**", r2 + 1)); ) {
          let o3 = r2;
          for (; "**" === n2[o3 + 1]; ) o3++;
          o3 > r2 && n2.splice(r2 + 1, o3 - r2);
          let i2 = n2[r2 + 1];
          const s2 = n2[r2 + 2], a2 = n2[r2 + 3];
          if (".." !== i2) continue;
          if (!s2 || "." === s2 || ".." === s2 || !a2 || "." === a2 || ".." === a2) continue;
          e2 = true, n2.splice(r2, 1);
          const u2 = n2.slice(0);
          u2[r2] = "**", t2.push(u2), r2--;
        }
        if (!this.preserveMultipleSlashes) {
          for (let t3 = 1; t3 < n2.length - 1; t3++) {
            const r3 = n2[t3];
            1 === t3 && "" === r3 && "" === n2[0] || "." !== r3 && "" !== r3 || (e2 = true, n2.splice(t3, 1), t3--);
          }
          "." !== n2[0] || 2 !== n2.length || "." !== n2[1] && "" !== n2[1] || (e2 = true, n2.pop());
        }
        let o2 = 0;
        for (; -1 !== (o2 = n2.indexOf("..", o2 + 1)); ) {
          const t3 = n2[o2 - 1];
          if (t3 && "." !== t3 && ".." !== t3 && "**" !== t3) {
            e2 = true;
            const t4 = 1 === o2 && "**" === n2[o2 + 1] ? ["."] : [];
            n2.splice(o2 - 1, 2, ...t4), 0 === n2.length && n2.push(""), o2 -= 2;
          }
        }
      }
    } while (e2);
    return t2;
  }
  secondPhasePreProcess(t2) {
    for (let e2 = 0; e2 < t2.length - 1; e2++) for (let n2 = e2 + 1; n2 < t2.length; n2++) {
      const r2 = this.partsMatch(t2[e2], t2[n2], !this.preserveMultipleSlashes);
      if (r2) {
        t2[e2] = [], t2[n2] = r2;
        break;
      }
    }
    return t2.filter(((t3) => t3.length));
  }
  partsMatch(t2, e2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], r2 = 0, o2 = 0, i2 = [], s2 = "";
    for (; r2 < t2.length && o2 < e2.length; ) if (t2[r2] === e2[o2]) i2.push("b" === s2 ? e2[o2] : t2[r2]), r2++, o2++;
    else if (n2 && "**" === t2[r2] && e2[o2] === t2[r2 + 1]) i2.push(t2[r2]), r2++;
    else if (n2 && "**" === e2[o2] && t2[r2] === e2[o2 + 1]) i2.push(e2[o2]), o2++;
    else if ("*" !== t2[r2] || !e2[o2] || !this.options.dot && e2[o2].startsWith(".") || "**" === e2[o2]) {
      if ("*" !== e2[o2] || !t2[r2] || !this.options.dot && t2[r2].startsWith(".") || "**" === t2[r2]) return false;
      if ("a" === s2) return false;
      s2 = "b", i2.push(e2[o2]), r2++, o2++;
    } else {
      if ("b" === s2) return false;
      s2 = "a", i2.push(t2[r2]), r2++, o2++;
    }
    return t2.length === e2.length && i2;
  }
  parseNegate() {
    if (this.nonegate) return;
    const t2 = this.pattern;
    let e2 = false, n2 = 0;
    for (let r2 = 0; r2 < t2.length && "!" === t2.charAt(r2); r2++) e2 = !e2, n2++;
    n2 && (this.pattern = t2.slice(n2)), this.negate = e2;
  }
  matchOne(t2, e2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
    const r2 = this.options;
    if (this.isWindows) {
      const n3 = "string" == typeof t2[0] && /^[a-z]:$/i.test(t2[0]), r3 = !n3 && "" === t2[0] && "" === t2[1] && "?" === t2[2] && /^[a-z]:$/i.test(t2[3]), o3 = "string" == typeof e2[0] && /^[a-z]:$/i.test(e2[0]), i3 = r3 ? 3 : n3 ? 0 : void 0, s3 = !o3 && "" === e2[0] && "" === e2[1] && "?" === e2[2] && "string" == typeof e2[3] && /^[a-z]:$/i.test(e2[3]) ? 3 : o3 ? 0 : void 0;
      if ("number" == typeof i3 && "number" == typeof s3) {
        const [n4, r4] = [t2[i3], e2[s3]];
        n4.toLowerCase() === r4.toLowerCase() && (e2[s3] = n4, s3 > i3 ? e2 = e2.slice(s3) : i3 > s3 && (t2 = t2.slice(i3)));
      }
    }
    const { optimizationLevel: o2 = 1 } = this.options;
    o2 >= 2 && (t2 = this.levelTwoFileOptimize(t2)), this.debug("matchOne", this, { file: t2, pattern: e2 }), this.debug("matchOne", t2.length, e2.length);
    for (var i2 = 0, s2 = 0, a2 = t2.length, u2 = e2.length; i2 < a2 && s2 < u2; i2++, s2++) {
      this.debug("matchOne loop");
      var c2 = e2[s2], l2 = t2[i2];
      if (this.debug(e2, c2, l2), false === c2) return false;
      if (c2 === Bt) {
        this.debug("GLOBSTAR", [e2, c2, l2]);
        var h2 = i2, p2 = s2 + 1;
        if (p2 === u2) {
          for (this.debug("** at the end"); i2 < a2; i2++) if ("." === t2[i2] || ".." === t2[i2] || !r2.dot && "." === t2[i2].charAt(0)) return false;
          return true;
        }
        for (; h2 < a2; ) {
          var f2 = t2[h2];
          if (this.debug("\nglobstar while", t2, h2, e2, p2, f2), this.matchOne(t2.slice(h2), e2.slice(p2), n2)) return this.debug("globstar found match!", h2, a2, f2), true;
          if ("." === f2 || ".." === f2 || !r2.dot && "." === f2.charAt(0)) {
            this.debug("dot detected!", t2, h2, e2, p2);
            break;
          }
          this.debug("globstar swallow a segment, and continue"), h2++;
        }
        return !(!n2 || (this.debug("\n>>> no match, partial?", t2, h2, e2, p2), h2 !== a2));
      }
      let o3;
      if ("string" == typeof c2 ? (o3 = l2 === c2, this.debug("string match", c2, l2, o3)) : (o3 = c2.test(l2), this.debug("pattern match", c2, l2, o3)), !o3) return false;
    }
    if (i2 === a2 && s2 === u2) return true;
    if (i2 === a2) return n2;
    if (s2 === u2) return i2 === a2 - 1 && "" === t2[i2];
    throw new Error("wtf?");
  }
  braceExpand() {
    return Wt(this.pattern, this.options);
  }
  parse(t2) {
    rt(t2);
    const e2 = this.options;
    if ("**" === t2) return Bt;
    if ("" === t2) return "";
    let n2, r2 = null;
    (n2 = t2.match($t)) ? r2 = e2.dot ? It : Ct : (n2 = t2.match(wt)) ? r2 = (e2.nocase ? e2.dot ? Pt : At : e2.dot ? Nt : xt)(n2[1]) : (n2 = t2.match(kt)) ? r2 = (e2.nocase ? e2.dot ? Lt : Rt : e2.dot ? _t : Mt)(n2) : (n2 = t2.match(Ot)) ? r2 = e2.dot ? Tt : Et : (n2 = t2.match(jt)) && (r2 = St);
    const o2 = vt.fromGlob(t2, this.options).toMMPattern();
    return r2 && "object" == typeof o2 && Reflect.defineProperty(o2, "test", { value: r2 }), o2;
  }
  makeRe() {
    if (this.regexp || false === this.regexp) return this.regexp;
    const t2 = this.set;
    if (!t2.length) return this.regexp = false, this.regexp;
    const e2 = this.options, n2 = e2.noglobstar ? "[^/]*?" : e2.dot ? "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?" : "(?:(?!(?:\\/|^)\\.).)*?", r2 = new Set(e2.nocase ? ["i"] : []);
    let o2 = t2.map(((t3) => {
      const e3 = t3.map(((t4) => {
        if (t4 instanceof RegExp) for (const e4 of t4.flags.split("")) r2.add(e4);
        return "string" == typeof t4 ? t4.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : t4 === Bt ? Bt : t4._src;
      }));
      return e3.forEach(((t4, r3) => {
        const o3 = e3[r3 + 1], i3 = e3[r3 - 1];
        t4 === Bt && i3 !== Bt && (void 0 === i3 ? void 0 !== o3 && o3 !== Bt ? e3[r3 + 1] = "(?:\\/|" + n2 + "\\/)?" + o3 : e3[r3] = n2 : void 0 === o3 ? e3[r3 - 1] = i3 + "(?:\\/|" + n2 + ")?" : o3 !== Bt && (e3[r3 - 1] = i3 + "(?:\\/|\\/" + n2 + "\\/)" + o3, e3[r3 + 1] = Bt));
      })), e3.filter(((t4) => t4 !== Bt)).join("/");
    })).join("|");
    const [i2, s2] = t2.length > 1 ? ["(?:", ")"] : ["", ""];
    o2 = "^" + i2 + o2 + s2 + "$", this.negate && (o2 = "^(?!" + o2 + ").+$");
    try {
      this.regexp = new RegExp(o2, [...r2].join(""));
    } catch (t3) {
      this.regexp = false;
    }
    return this.regexp;
  }
  slashSplit(t2) {
    return this.preserveMultipleSlashes ? t2.split("/") : this.isWindows && /^\/\/[^\/]+/.test(t2) ? ["", ...t2.split(/\/+/)] : t2.split(/\/+/);
  }
  match(t2) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.partial;
    if (this.debug("match", t2, this.pattern), this.comment) return false;
    if (this.empty) return "" === t2;
    if ("/" === t2 && e2) return true;
    const n2 = this.options;
    this.isWindows && (t2 = t2.split("\\").join("/"));
    const r2 = this.slashSplit(t2);
    this.debug(this.pattern, "split", r2);
    const o2 = this.set;
    this.debug(this.pattern, "set", o2);
    let i2 = r2[r2.length - 1];
    if (!i2) for (let t3 = r2.length - 2; !i2 && t3 >= 0; t3--) i2 = r2[t3];
    for (let t3 = 0; t3 < o2.length; t3++) {
      const s2 = o2[t3];
      let a2 = r2;
      if (n2.matchBase && 1 === s2.length && (a2 = [i2]), this.matchOne(a2, s2, e2)) return !!n2.flipNegate || !this.negate;
    }
    return !n2.flipNegate && this.negate;
  }
  static defaults(t2) {
    return bt.defaults(t2).Minimatch;
  }
};
function qt(t2) {
  const e2 = new Error(`${arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : ""}Invalid response: ${t2.status} ${t2.statusText}`);
  return e2.status = t2.status, e2.response = t2, e2;
}
function Ht(t2, e2) {
  const { status: n2 } = e2;
  if (401 === n2 && t2.digest) return e2;
  if (n2 >= 400) throw qt(e2);
  return e2;
}
function Xt(t2, e2) {
  return arguments.length > 2 && void 0 !== arguments[2] && arguments[2] ? { data: e2, headers: t2.headers ? W(t2.headers) : {}, status: t2.status, statusText: t2.statusText } : e2;
}
bt.AST = vt, bt.Minimatch = Gt, bt.escape = function(t2) {
  let { windowsPathsNoEscape: e2 = false } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return e2 ? t2.replace(/[?*()[\]]/g, "[$&]") : t2.replace(/[?*()[\]\\]/g, "\\$&");
}, bt.unescape = ut;
var Zt = (Yt = function(t2, e2, n2) {
  let r2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
  const o2 = tt({ url: y(t2.remoteURL, f(e2)), method: "COPY", headers: { Destination: y(t2.remoteURL, f(n2)), Overwrite: false === r2.overwrite ? "F" : "T", Depth: r2.shallow ? "0" : "infinity" } }, t2, r2);
  return s2 = function(e3) {
    Ht(t2, e3);
  }, (i2 = Q(o2, t2)) && i2.then || (i2 = Promise.resolve(i2)), s2 ? i2.then(s2) : i2;
  var i2, s2;
}, function() {
  for (var t2 = [], e2 = 0; e2 < arguments.length; e2++) t2[e2] = arguments[e2];
  try {
    return Promise.resolve(Yt.apply(this, t2));
  } catch (t3) {
    return Promise.reject(t3);
  }
});
var Yt;
var Kt = n(635);
var Jt = n(829);
var Qt = n.n(Jt);
var te = (function(t2) {
  return t2.Array = "array", t2.Object = "object", t2.Original = "original", t2;
})(te || {});
function ee(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : te.Original;
  const r2 = Qt().get(t2, e2);
  return "array" === n2 && false === Array.isArray(r2) ? [r2] : "object" === n2 && Array.isArray(r2) ? r2[0] : r2;
}
function ne(t2) {
  return new Promise(((e2) => {
    e2((function(t3) {
      const { multistatus: e3 } = t3;
      if ("" === e3) return { multistatus: { response: [] } };
      if (!e3) throw new Error("Invalid response: No root multistatus found");
      const n2 = { multistatus: Array.isArray(e3) ? e3[0] : e3 };
      return Qt().set(n2, "multistatus.response", ee(n2, "multistatus.response", te.Array)), Qt().set(n2, "multistatus.response", Qt().get(n2, "multistatus.response").map(((t4) => (function(t5) {
        const e4 = Object.assign({}, t5);
        return e4.status ? Qt().set(e4, "status", ee(e4, "status", te.Object)) : (Qt().set(e4, "propstat", ee(e4, "propstat", te.Object)), Qt().set(e4, "propstat.prop", ee(e4, "propstat.prop", te.Object))), e4;
      })(t4)))), n2;
    })(new Kt.XMLParser({ allowBooleanAttributes: true, attributeNamePrefix: "", textNodeName: "text", ignoreAttributes: false, removeNSPrefix: true, numberParseOptions: { hex: true, leadingZeros: false }, attributeValueProcessor: (t3, e3, n2) => "true" === e3 || "false" === e3 ? "true" === e3 : e3, tagValueProcessor(t3, e3, n2) {
      if (!n2.endsWith("propstat.prop.displayname")) return e3;
    } }).parse(t2)));
  }));
}
function re(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
  const { getlastmodified: r2 = null, getcontentlength: o2 = "0", resourcetype: i2 = null, getcontenttype: s2 = null, getetag: a2 = null } = t2, u2 = i2 && "object" == typeof i2 && void 0 !== i2.collection ? "directory" : "file", c2 = { filename: e2, basename: l().basename(e2), lastmod: r2, size: parseInt(o2, 10), type: u2, etag: "string" == typeof a2 ? a2.replace(/"/g, "") : null };
  return "file" === u2 && (c2.mime = s2 && "string" == typeof s2 ? s2.split(";")[0] : ""), n2 && (void 0 !== t2.displayname && (t2.displayname = String(t2.displayname)), c2.props = t2), c2;
}
function oe(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], r2 = null;
  try {
    t2.multistatus.response[0].propstat && (r2 = t2.multistatus.response[0]);
  } catch (t3) {
  }
  if (!r2) throw new Error("Failed getting item stat: bad response");
  const { propstat: { prop: o2, status: i2 } } = r2, [s2, a2, u2] = i2.split(" ", 3), c2 = parseInt(a2, 10);
  if (c2 >= 400) {
    const t3 = new Error(`Invalid response: ${c2} ${u2}`);
    throw t3.status = c2, t3;
  }
  return re(o2, g(e2), n2);
}
function ie(t2) {
  switch (String(t2)) {
    case "-3":
      return "unlimited";
    case "-2":
    case "-1":
      return "unknown";
    default:
      return parseInt(String(t2), 10);
  }
}
function se(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var ae = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const { details: r2 = false } = n2, o2 = tt({ url: y(t2.remoteURL, f(e2)), method: "PROPFIND", headers: { Accept: "text/plain,application/xml", Depth: "0" } }, t2, n2);
  return se(Q(o2, t2), (function(n3) {
    return Ht(t2, n3), se(n3.text(), (function(t3) {
      return se(ne(t3), (function(t4) {
        const o3 = oe(t4, e2, r2);
        return Xt(n3, o3, r2);
      }));
    }));
  }));
}));
function ue(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var ce = le((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = (function(t3) {
    if (!t3 || "/" === t3) return [];
    let e3 = t3;
    const n3 = [];
    do {
      n3.push(e3), e3 = l().dirname(e3);
    } while (e3 && "/" !== e3);
    return n3;
  })(g(e2));
  r2.sort(((t3, e3) => t3.length > e3.length ? 1 : e3.length > t3.length ? -1 : 0));
  let o2 = false;
  return (function(t3, e3, n3) {
    if ("function" == typeof t3[fe]) {
      let l2 = function(t4) {
        try {
          for (; !(r3 = s2.next()).done; ) if ((t4 = e3(r3.value)) && t4.then) {
            if (!me(t4)) return void t4.then(l2, i2 || (i2 = de.bind(null, o3 = new ge(), 2)));
            t4 = t4.v;
          }
          o3 ? de(o3, 1, t4) : o3 = t4;
        } catch (t5) {
          de(o3 || (o3 = new ge()), 2, t5);
        }
      };
      var r3, o3, i2, s2 = t3[fe]();
      if (l2(), s2.return) {
        var a2 = function(t4) {
          try {
            r3.done || s2.return();
          } catch (t5) {
          }
          return t4;
        };
        if (o3 && o3.then) return o3.then(a2, (function(t4) {
          throw a2(t4);
        }));
        a2();
      }
      return o3;
    }
    if (!("length" in t3)) throw new TypeError("Object is not iterable");
    for (var u2 = [], c2 = 0; c2 < t3.length; c2++) u2.push(t3[c2]);
    return (function(t4, e4, n4) {
      var r4, o4, i3 = -1;
      return (function s3(a3) {
        try {
          for (; ++i3 < t4.length && (!n4 || !n4()); ) if ((a3 = e4(i3)) && a3.then) {
            if (!me(a3)) return void a3.then(s3, o4 || (o4 = de.bind(null, r4 = new ge(), 2)));
            a3 = a3.v;
          }
          r4 ? de(r4, 1, a3) : r4 = a3;
        } catch (t5) {
          de(r4 || (r4 = new ge()), 2, t5);
        }
      })(), r4;
    })(u2, (function(t4) {
      return e3(u2[t4]);
    }), n3);
  })(r2, (function(r3) {
    return i2 = function() {
      return (function(n3, o3) {
        try {
          var i3 = ue(ae(t2, r3), (function(t3) {
            if ("directory" !== t3.type) throw new Error(`Path includes a file: ${e2}`);
          }));
        } catch (t3) {
          return o3(t3);
        }
        return i3 && i3.then ? i3.then(void 0, o3) : i3;
      })(0, (function(e3) {
        const i3 = e3;
        return (function() {
          if (404 === i3.status) return o2 = true, pe(ye(t2, r3, { ...n2, recursive: false }));
          throw e3;
        })();
      }));
    }, (s2 = (function() {
      if (o2) return pe(ye(t2, r3, { ...n2, recursive: false }));
    })()) && s2.then ? s2.then(i2) : i2();
    var i2, s2;
  }), (function() {
    return false;
  }));
}));
function le(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
}
function he() {
}
function pe(t2, e2) {
  if (!e2) return t2 && t2.then ? t2.then(he) : Promise.resolve();
}
var fe = "undefined" != typeof Symbol ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
function de(t2, e2, n2) {
  if (!t2.s) {
    if (n2 instanceof ge) {
      if (!n2.s) return void (n2.o = de.bind(null, t2, e2));
      1 & e2 && (e2 = n2.s), n2 = n2.v;
    }
    if (n2 && n2.then) return void n2.then(de.bind(null, t2, e2), de.bind(null, t2, 2));
    t2.s = e2, t2.v = n2;
    const r2 = t2.o;
    r2 && r2(t2);
  }
}
var ge = (function() {
  function t2() {
  }
  return t2.prototype.then = function(e2, n2) {
    const r2 = new t2(), o2 = this.s;
    if (o2) {
      const t3 = 1 & o2 ? e2 : n2;
      if (t3) {
        try {
          de(r2, 1, t3(this.v));
        } catch (t4) {
          de(r2, 2, t4);
        }
        return r2;
      }
      return this;
    }
    return this.o = function(t3) {
      try {
        const o3 = t3.v;
        1 & t3.s ? de(r2, 1, e2 ? e2(o3) : o3) : n2 ? de(r2, 1, n2(o3)) : de(r2, 2, o3);
      } catch (t4) {
        de(r2, 2, t4);
      }
    }, r2;
  }, t2;
})();
function me(t2) {
  return t2 instanceof ge && 1 & t2.s;
}
var ye = le((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  if (true === n2.recursive) return ce(t2, e2, n2);
  const r2 = tt({ url: y(t2.remoteURL, (o2 = f(e2), o2.endsWith("/") ? o2 : o2 + "/")), method: "MKCOL" }, t2, n2);
  var o2;
  return ue(Q(r2, t2), (function(e3) {
    Ht(t2, e3);
  }));
}));
var ve = n(388);
var be = n.n(ve);
var we = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = {};
  if ("object" == typeof n2.range && "number" == typeof n2.range.start) {
    let t3 = `bytes=${n2.range.start}-`;
    "number" == typeof n2.range.end && (t3 = `${t3}${n2.range.end}`), r2.Range = t3;
  }
  const o2 = tt({ url: y(t2.remoteURL, f(e2)), method: "GET", headers: r2 }, t2, n2);
  return s2 = function(e3) {
    if (Ht(t2, e3), r2.Range && 206 !== e3.status) {
      const t3 = new Error(`Invalid response code for partial request: ${e3.status}`);
      throw t3.status = e3.status, t3;
    }
    return n2.callback && setTimeout((() => {
      n2.callback(e3);
    }), 0), e3.body;
  }, (i2 = Q(o2, t2)) && i2.then || (i2 = Promise.resolve(i2)), s2 ? i2.then(s2) : i2;
  var i2, s2;
}));
var xe = () => {
};
var Ne = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2, n2) {
  n2.url || (n2.url = y(t2.remoteURL, f(e2)));
  const r2 = tt(n2, t2, {});
  return i2 = function(e3) {
    return Ht(t2, e3), e3;
  }, (o2 = Q(r2, t2)) && o2.then || (o2 = Promise.resolve(o2)), i2 ? o2.then(i2) : o2;
  var o2, i2;
}));
var Ae = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = tt({ url: y(t2.remoteURL, f(e2)), method: "DELETE" }, t2, n2);
  return i2 = function(e3) {
    Ht(t2, e3);
  }, (o2 = Q(r2, t2)) && o2.then || (o2 = Promise.resolve(o2)), i2 ? o2.then(i2) : o2;
  var o2, i2;
}));
var Pe = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  return (function(r2, o2) {
    try {
      var i2 = (s2 = ae(t2, e2, n2), a2 = function() {
        return true;
      }, u2 ? a2 ? a2(s2) : s2 : (s2 && s2.then || (s2 = Promise.resolve(s2)), a2 ? s2.then(a2) : s2));
    } catch (t3) {
      return o2(t3);
    }
    var s2, a2, u2;
    return i2 && i2.then ? i2.then(void 0, o2) : i2;
  })(0, (function(t3) {
    if (404 === t3.status) return false;
    throw t3;
  }));
}));
function Oe(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var Ee = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = tt({ url: y(t2.remoteURL, f(e2), "/"), method: "PROPFIND", headers: { Accept: "text/plain,application/xml", Depth: n2.deep ? "infinity" : "1" } }, t2, n2);
  return Oe(Q(r2, t2), (function(r3) {
    return Ht(t2, r3), Oe(r3.text(), (function(o2) {
      if (!o2) throw new Error("Failed parsing directory contents: Empty response");
      return Oe(ne(o2), (function(o3) {
        const i2 = d(e2);
        let s2 = (function(t3, e3, n3) {
          let r4 = arguments.length > 3 && void 0 !== arguments[3] && arguments[3], o4 = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
          const i3 = l().join(e3, "/"), { multistatus: { response: s3 } } = t3, a2 = s3.map(((t4) => {
            const e4 = (function(t5) {
              try {
                return t5.replace(/^https?:\/\/[^\/]+/, "");
              } catch (t6) {
                throw new u(t6, "Failed normalising HREF");
              }
            })(t4.href), { propstat: { prop: n4 } } = t4;
            return re(n4, "/" === i3 ? decodeURIComponent(g(e4)) : g(l().relative(decodeURIComponent(i3), decodeURIComponent(e4))), r4);
          }));
          return o4 ? a2 : a2.filter(((t4) => t4.basename && ("file" === t4.type || t4.filename !== n3.replace(/\/$/, ""))));
        })(o3, d(t2.remoteBasePath || t2.remotePath), i2, n2.details, n2.includeSelf);
        return n2.glob && (s2 = (function(t3, e3) {
          return t3.filter(((t4) => bt(t4.filename, e3, { matchBase: true })));
        })(s2, n2.glob)), Xt(r3, s2, n2.details);
      }));
    }));
  }));
}));
function Te(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
}
var je = Te((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = tt({ url: y(t2.remoteURL, f(e2)), method: "GET", headers: { Accept: "text/plain" }, transformResponse: [Ie] }, t2, n2);
  return Se(Q(r2, t2), (function(e3) {
    return Ht(t2, e3), Se(e3.text(), (function(t3) {
      return Xt(e3, t3, n2.details);
    }));
  }));
}));
function Se(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var $e = Te((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = tt({ url: y(t2.remoteURL, f(e2)), method: "GET" }, t2, n2);
  return Se(Q(r2, t2), (function(e3) {
    let r3;
    return Ht(t2, e3), (function(t3, e4) {
      var n3 = t3();
      return n3 && n3.then ? n3.then(e4) : e4();
    })((function() {
      return Se(e3.arrayBuffer(), (function(t3) {
        r3 = t3;
      }));
    }), (function() {
      return Xt(e3, r3, n2.details);
    }));
  }));
}));
var Ce = Te((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const { format: r2 = "binary" } = n2;
  if ("binary" !== r2 && "text" !== r2) throw new u({ info: { code: I.InvalidOutputFormat } }, `Invalid output format: ${r2}`);
  return "text" === r2 ? je(t2, e2, n2) : $e(t2, e2, n2);
}));
var Ie = (t2) => t2;
function ke(t2) {
  return new Kt.XMLBuilder({ attributeNamePrefix: "@_", format: true, ignoreAttributes: false, suppressEmptyNode: true }).build(Re({ lockinfo: { "@_xmlns:d": "DAV:", lockscope: { exclusive: {} }, locktype: { write: {} }, owner: { href: t2 } } }, "d"));
}
function Re(t2, e2) {
  const n2 = { ...t2 };
  for (const t3 in n2) n2.hasOwnProperty(t3) && (n2[t3] && "object" == typeof n2[t3] && -1 === t3.indexOf(":") ? (n2[`${e2}:${t3}`] = Re(n2[t3], e2), delete n2[t3]) : false === /^@_/.test(t3) && (n2[`${e2}:${t3}`] = n2[t3], delete n2[t3]));
  return n2;
}
function Le(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
function _e(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
}
var Me = _e((function(t2, e2, n2) {
  let r2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
  const o2 = tt({ url: y(t2.remoteURL, f(e2)), method: "UNLOCK", headers: { "Lock-Token": n2 } }, t2, r2);
  return Le(Q(o2, t2), (function(e3) {
    if (Ht(t2, e3), 204 !== e3.status && 200 !== e3.status) throw qt(e3);
  }));
}));
var Ue = _e((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const { refreshToken: r2, timeout: o2 = Fe } = n2, i2 = { Accept: "text/plain,application/xml", Timeout: o2 };
  r2 && (i2.If = r2);
  const s2 = tt({ url: y(t2.remoteURL, f(e2)), method: "LOCK", headers: i2, data: ke(t2.contactHref) }, t2, n2);
  return Le(Q(s2, t2), (function(e3) {
    return Ht(t2, e3), Le(e3.text(), (function(t3) {
      const n3 = (i3 = t3, new Kt.XMLParser({ removeNSPrefix: true, parseAttributeValue: true, parseTagValue: true }).parse(i3)), r3 = Qt().get(n3, "prop.lockdiscovery.activelock.locktoken.href"), o3 = Qt().get(n3, "prop.lockdiscovery.activelock.timeout");
      var i3;
      if (!r3) throw qt(e3, "No lock token received: ");
      return { token: r3, serverTimeout: o3 };
    }));
  }));
}));
var Fe = "Infinite, Second-4100000000";
function De(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var Be = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  const n2 = e2.path || "/", r2 = tt({ url: y(t2.remoteURL, n2), method: "PROPFIND", headers: { Accept: "text/plain,application/xml", Depth: "0" } }, t2, e2);
  return De(Q(r2, t2), (function(n3) {
    return Ht(t2, n3), De(n3.text(), (function(t3) {
      return De(ne(t3), (function(t4) {
        const r3 = (function(t5) {
          try {
            const [e3] = t5.multistatus.response, { propstat: { prop: { "quota-used-bytes": n4, "quota-available-bytes": r4 } } } = e3;
            return void 0 !== n4 && void 0 !== r4 ? { used: parseInt(String(n4), 10), available: ie(r4) } : null;
          } catch (t6) {
          }
          return null;
        })(t4);
        return Xt(n3, r3, e2.details);
      }));
    }));
  }));
}));
function Ve(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var We = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const { details: r2 = false } = n2, o2 = tt({ url: y(t2.remoteURL, f(e2)), method: "SEARCH", headers: { Accept: "text/plain,application/xml", "Content-Type": t2.headers["Content-Type"] || "application/xml; charset=utf-8" } }, t2, n2);
  return Ve(Q(o2, t2), (function(n3) {
    return Ht(t2, n3), Ve(n3.text(), (function(t3) {
      return Ve(ne(t3), (function(t4) {
        const o3 = (function(t5, e3, n4) {
          const r3 = { truncated: false, results: [] };
          return r3.truncated = t5.multistatus.response.some(((t6) => "507" === (t6.status || t6.propstat?.status).split(" ", 3)?.[1] && t6.href.replace(/\/$/, "").endsWith(f(e3).replace(/\/$/, "")))), t5.multistatus.response.forEach(((t6) => {
            if (void 0 === t6.propstat) return;
            const e4 = t6.href.split("/").map(decodeURIComponent).join("/");
            r3.results.push(re(t6.propstat.prop, e4, n4));
          })), r3;
        })(t4, e2, r2);
        return Xt(n3, o3, r2);
      }));
    }));
  }));
}));
var ze = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2, n2) {
  let r2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
  const o2 = tt({ url: y(t2.remoteURL, f(e2)), method: "MOVE", headers: { Destination: y(t2.remoteURL, f(n2)), Overwrite: false === r2.overwrite ? "F" : "T" } }, t2, r2);
  return s2 = function(e3) {
    Ht(t2, e3);
  }, (i2 = Q(o2, t2)) && i2.then || (i2 = Promise.resolve(i2)), s2 ? i2.then(s2) : i2;
  var i2, s2;
}));
var Ge = n(172);
var qe = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2, n2) {
  let r2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
  const { contentLength: o2 = true, overwrite: i2 = true } = r2, s2 = { "Content-Type": "application/octet-stream" };
  false === o2 || (s2["Content-Length"] = "number" == typeof o2 ? `${o2}` : `${(function(t3) {
    if (H(t3)) return t3.byteLength;
    if (X(t3)) return t3.length;
    if ("string" == typeof t3) return (0, Ge.d)(t3);
    throw new u({ info: { code: I.DataTypeNoLength } }, "Cannot calculate data length: Invalid type");
  })(n2)}`), i2 || (s2["If-None-Match"] = "*");
  const a2 = tt({ url: y(t2.remoteURL, f(e2)), method: "PUT", headers: s2, data: n2 }, t2, r2);
  return l2 = function(e3) {
    try {
      Ht(t2, e3);
    } catch (t3) {
      const e4 = t3;
      if (412 !== e4.status || i2) throw e4;
      return false;
    }
    return true;
  }, (c2 = Q(a2, t2)) && c2.then || (c2 = Promise.resolve(c2)), l2 ? c2.then(l2) : c2;
  var c2, l2;
}));
var He = /* @__PURE__ */ (function(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
})((function(t2, e2) {
  let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  const r2 = tt({ url: y(t2.remoteURL, f(e2)), method: "OPTIONS" }, t2, n2);
  return i2 = function(e3) {
    try {
      Ht(t2, e3);
    } catch (t3) {
      throw t3;
    }
    return { compliance: (e3.headers.get("DAV") ?? "").split(",").map(((t3) => t3.trim())), server: e3.headers.get("Server") ?? "" };
  }, (o2 = Q(r2, t2)) && o2.then || (o2 = Promise.resolve(o2)), i2 ? o2.then(i2) : o2;
  var o2, i2;
}));
function Xe(t2, e2, n2) {
  return n2 ? e2 ? e2(t2) : t2 : (t2 && t2.then || (t2 = Promise.resolve(t2)), e2 ? t2.then(e2) : t2);
}
var Ze = Je((function(t2, e2, n2, r2, o2) {
  let i2 = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : {};
  if (n2 > r2 || n2 < 0) throw new u({ info: { code: I.InvalidUpdateRange } }, `Invalid update range ${n2} for partial update`);
  const s2 = { "Content-Type": "application/octet-stream", "Content-Length": "" + (r2 - n2 + 1), "Content-Range": `bytes ${n2}-${r2}/*` }, a2 = tt({ url: y(t2.remoteURL, f(e2)), method: "PUT", headers: s2, data: o2 }, t2, i2);
  return Xe(Q(a2, t2), (function(e3) {
    Ht(t2, e3);
  }));
}));
function Ye(t2, e2) {
  var n2 = t2();
  return n2 && n2.then ? n2.then(e2) : e2(n2);
}
var Ke = Je((function(t2, e2, n2, r2, o2) {
  let i2 = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : {};
  if (n2 > r2 || n2 < 0) throw new u({ info: { code: I.InvalidUpdateRange } }, `Invalid update range ${n2} for partial update`);
  const s2 = { "Content-Type": "application/x-sabredav-partialupdate", "Content-Length": "" + (r2 - n2 + 1), "X-Update-Range": `bytes=${n2}-${r2}` }, a2 = tt({ url: y(t2.remoteURL, f(e2)), method: "PATCH", headers: s2, data: o2 }, t2, i2);
  return Xe(Q(a2, t2), (function(e3) {
    Ht(t2, e3);
  }));
}));
function Je(t2) {
  return function() {
    for (var e2 = [], n2 = 0; n2 < arguments.length; n2++) e2[n2] = arguments[n2];
    try {
      return Promise.resolve(t2.apply(this, e2));
    } catch (t3) {
      return Promise.reject(t3);
    }
  };
}
var Qe = Je((function(t2, e2, n2, r2, o2) {
  let i2 = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : {};
  return Xe(He(t2, e2, i2), (function(s2) {
    let a2 = false;
    return Ye((function() {
      if (s2.compliance.includes("sabredav-partialupdate")) return Xe(Ke(t2, e2, n2, r2, o2, i2), (function(t3) {
        return a2 = true, t3;
      }));
    }), (function(c2) {
      let l2 = false;
      return a2 ? c2 : Ye((function() {
        if (s2.server.includes("Apache") && s2.compliance.includes("<http://apache.org/dav/propset/fs/1>")) return Xe(Ze(t2, e2, n2, r2, o2, i2), (function(t3) {
          return l2 = true, t3;
        }));
      }), (function(t3) {
        if (l2) return t3;
        throw new u({ info: { code: I.NotSupported } }, "Not supported");
      }));
    }));
  }));
}));
var tn = "https://github.com/perry-mitchell/webdav-client/blob/master/LOCK_CONTACT.md";
function en(t2) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  const { authType: n2 = null, remoteBasePath: r2, contactHref: o2 = tn, ha1: i2, headers: s2 = {}, httpAgent: a2, httpsAgent: c2, password: l2, token: h2, username: p2, withCredentials: d2 } = e2;
  let g2 = n2;
  g2 || (g2 = p2 || l2 ? C.Password : C.None);
  const v2 = { authType: g2, remoteBasePath: r2, contactHref: o2, ha1: i2, headers: Object.assign({}, s2), httpAgent: a2, httpsAgent: c2, password: l2, remotePath: m(t2), remoteURL: t2, token: h2, username: p2, withCredentials: d2 };
  return k(v2, p2, l2, h2, i2), { copyFile: (t3, e3, n3) => Zt(v2, t3, e3, n3), createDirectory: (t3, e3) => ye(v2, t3, e3), createReadStream: (t3, e3) => (function(t4, e4) {
    let n3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    const r3 = new (0, be().PassThrough)();
    return we(t4, e4, n3).then(((t5) => {
      t5.pipe(r3);
    })).catch(((t5) => {
      r3.emit("error", t5);
    })), r3;
  })(v2, t3, e3), createWriteStream: (t3, e3, n3) => (function(t4, e4) {
    let n4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, r3 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : xe;
    const o3 = new (0, be().PassThrough)(), i3 = {};
    false === n4.overwrite && (i3["If-None-Match"] = "*");
    const s3 = tt({ url: y(t4.remoteURL, f(e4)), method: "PUT", headers: i3, data: o3, maxRedirects: 0 }, t4, n4);
    return Q(s3, t4).then(((e5) => Ht(t4, e5))).then(((t5) => {
      setTimeout((() => {
        r3(t5);
      }), 0);
    })).catch(((t5) => {
      o3.emit("error", t5);
    })), o3;
  })(v2, t3, e3, n3), customRequest: (t3, e3) => Ne(v2, t3, e3), deleteFile: (t3, e3) => Ae(v2, t3, e3), exists: (t3, e3) => Pe(v2, t3, e3), getDirectoryContents: (t3, e3) => Ee(v2, t3, e3), getFileContents: (t3, e3) => Ce(v2, t3, e3), getFileDownloadLink: (t3) => (function(t4, e3) {
    let n3 = y(t4.remoteURL, f(e3));
    const r3 = /^https:/i.test(n3) ? "https" : "http";
    switch (t4.authType) {
      case C.None:
        break;
      case C.Password: {
        const e4 = O(t4.headers.Authorization.replace(/^Basic /i, "").trim());
        n3 = n3.replace(/^https?:\/\//, `${r3}://${e4}@`);
        break;
      }
      default:
        throw new u({ info: { code: I.LinkUnsupportedAuthType } }, `Unsupported auth type for file link: ${t4.authType}`);
    }
    return n3;
  })(v2, t3), getFileUploadLink: (t3) => (function(t4, e3) {
    let n3 = `${y(t4.remoteURL, f(e3))}?Content-Type=application/octet-stream`;
    const r3 = /^https:/i.test(n3) ? "https" : "http";
    switch (t4.authType) {
      case C.None:
        break;
      case C.Password: {
        const e4 = O(t4.headers.Authorization.replace(/^Basic /i, "").trim());
        n3 = n3.replace(/^https?:\/\//, `${r3}://${e4}@`);
        break;
      }
      default:
        throw new u({ info: { code: I.LinkUnsupportedAuthType } }, `Unsupported auth type for file link: ${t4.authType}`);
    }
    return n3;
  })(v2, t3), getHeaders: () => Object.assign({}, v2.headers), getQuota: (t3) => Be(v2, t3), lock: (t3, e3) => Ue(v2, t3, e3), moveFile: (t3, e3, n3) => ze(v2, t3, e3, n3), putFileContents: (t3, e3, n3) => qe(v2, t3, e3, n3), partialUpdateFileContents: (t3, e3, n3, r3, o3) => Qe(v2, t3, e3, n3, r3, o3), getDAVCompliance: (t3) => He(v2, t3), search: (t3, e3) => We(v2, t3, e3), setHeaders: (t3) => {
    v2.headers = Object.assign({}, t3);
  }, stat: (t3, e3) => ae(v2, t3, e3), unlock: (t3, e3, n3) => Me(v2, t3, e3, n3) };
}
var nn = r.hT;
var rn = r.O4;
var on = r.Kd;
var sn = r.YK;
var an = r.UU;
var un = r.Gu;
var cn = r.ky;
var ln = r.h4;
var hn = r.ch;
var pn = r.hq;
var fn = r.i5;

// public/index.html
var public_default = `<!DOCTYPE html>
<html>
<head>
    <title>EPUB \u9605\u8BFB\u5668</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="/epub.min.js"><\/script>
    <style>
        /* --- [ \u6837\u5F0F\u8868\u4FDD\u6301\u4E0D\u53D8 ] --- */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            background-color: #f8f9fa; /* \u7A0D\u5FAE\u63D0\u4EAE\u80CC\u666F\u8272 */
            color: #212529; /* \u66F4\u6DF1\u7684\u9ED8\u8BA4\u6587\u672C\u8272 */
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            padding: 24px; /* \u589E\u52A0\u5185\u8FB9\u8DDD */
            max-width: 800px;
            margin: 24px auto;
            background: #ffffff;
            border-radius: 12px;
            /* \u8C03\u6574\u4E86\u9634\u5F71\uFF0C\u4F7F\u5176\u66F4\u67D4\u548C */
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
            transition: all 0.3s ease;
        }
        .hidden { display: none !important; }

        h1, h2, h3, h4 {
            color: #1a202c;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 12px;
            margin-top: 0;
            margin-bottom: 20px; /* \u7EDF\u4E00\u4E0B\u65B9\u95F4\u8DDD */
        }

        /* \u5206\u79BB\u4E86\u6587\u672C\u8F93\u5165\u6846\u548C\u6587\u4EF6\u8F93\u5165\u6846\u7684\u6837\u5F0F */
        input[type="text"],
        input[type="password"] {
            width: calc(100% - 24px); /* \u8C03\u6574\u5BBD\u5EA6\u4EE5\u9002\u5E94 padding */
            padding: 12px; /* \u589E\u52A0\u5185\u8FB9\u8DDD */
            margin-bottom: 16px;
            border: 1px solid #cbd5e0;
            border-radius: 8px; /* \u66F4\u5706\u7684\u8FB9\u89D2 */
            transition: border-color 0.3s, box-shadow 0.3s;
            font-size: 16px;
        }
        input[type="text"]:focus,
        input[type="password"]:focus {
            border-color: #3B82F6; /* \u66F4\u6539\u9AD8\u4EAE\u8272 */
            outline: none;
            /* \u589E\u52A0\u73B0\u4EE3\u5316\u7684\u8F89\u5149\u6548\u679C */
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        /* --- \u6309\u94AE\u7F8E\u5316 --- */
        button {
            padding: 12px 22px; /* \u589E\u5927\u6309\u94AE */
            border: none;
            background-color: #3B82F6; /* \u73B0\u4EE3\u84DD\u8272 */
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s, transform 0.1s;
        }
        button:hover {
            background-color: #2563EB; /* \u60AC\u505C\u989C\u8272\u52A0\u6DF1 */
        }
        button:active {
            transform: translateY(1px);
        }

        /* \u6B21\u8981\u6309\u94AE\u6837\u5F0F */
        .button-secondary {
            background-color: #e2e8f0;
            color: #4a5568;
        }
        .button-secondary:hover {
            background-color: #cbd5e0;
        }

        #admin-panel {
            background: #f7fafc; /* \u4F7F\u7528\u66F4\u6D45\u7684\u80CC\u666F */
            border: 1px solid #e2e8f0;
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 8px;
        }

        /* --- \u4E66\u7C4D\u5217\u8868\u7F8E\u5316 --- */
        #book-list ul {
            list-style: none;
            padding: 0;
        }
        #book-list li {
            padding: 14px 18px; /* \u589E\u52A0\u5217\u8868\u9879\u5185\u8FB9\u8DDD */
            cursor: pointer;
            border-bottom: 1px solid #eef2f7; /* \u66F4\u6D45\u7684\u5206\u5272\u7EBF */
            transition: background-color 0.2s, border-radius 0.2s;
        }
        #book-list li:last-child {
            border-bottom: none;
        }
        #book-list li:hover {
            background-color: #f8f9fa;
            border-radius: 6px; /* \u60AC\u505C\u65F6\u589E\u52A0\u5706\u89D2 */
        }
        /* Style for error/info messages in book list */
        #book-list li.info-message {
            cursor: default;
            color: #555;
            font-style: italic;
            background-color: transparent; /* Ensure no hover effect */
        }


        /* --- \u9605\u8BFB\u5668\u7FFB\u9875\u6309\u94AE\u7F8E\u5316 --- */
        #viewer-container { position: relative; }
        #viewer {
            height: 80vh;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden; /* \u786E\u4FDD\u5B50\u5143\u7D20\u4E0D\u4F1A\u6EA2\u51FA\u5706\u89D2 */
        }

        #prev, #next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            padding: 0; /* \u91CD\u7F6E\u5185\u8FB9\u8DDD */
            background: rgba(0, 0, 0, 0.4); /* \u66F4\u4E2D\u6027\u7684\u80CC\u666F */
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px; /* \u8C03\u6574\u5B57\u4F53\u5927\u5C0F */
            border-radius: 50%;
            width: 44px; /* \u8C03\u6574\u5C3A\u5BF8 */
            height: 44px;
            line-height: 44px; /* \u5782\u76F4\u5C45\u4E2D */
            text-align: center;
            opacity: 0.7;
            transition: background-color 0.3s ease, opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
        }
        #prev:hover, #next:hover {
             background: rgba(0, 0, 0, 0.6);
             opacity: 1;
        }
        #prev { left: 15px; }
        #next { right: 15px; }

        .auth-toggle {
            color: #3B82F6; /* \u5339\u914D\u65B0\u7684\u4E3B\u9898\u8272 */
            cursor: pointer;
            text-decoration: none;
            font-weight: bold;
        }
        .auth-toggle:hover {
            text-decoration: underline;
        }
        #viewer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        /* --- \u4E0A\u4F20\u533A\u57DF\u7F8E\u5316 --- */
        #upload-container {
            margin-bottom: 20px;
            padding: 20px;
            border: 2px dashed #d1d5db; /* \u73B0\u4EE3\u5316\u865A\u7EBF\u6846 */
            border-radius: 8px;
            background-color: #fafafa;
            display: flex;
            flex-direction: column; /* \u5782\u76F4\u6392\u5217 */
            align-items: center; /* \u5C45\u4E2D */
            gap: 12px; /* \u5143\u7D20\u95F4\u8DDD */
            transition: border-color 0.3s, background-color 0.3s;
        }
        #upload-container:hover {
            border-color: #3B82F6;
            background-color: #fdfdff;
        }

        /* \u7F8E\u5316\u6587\u4EF6\u4E0A\u4F20\u6309\u94AE */
        input[type="file"] {
            width: 100%;
            font-size: 14px;
            color: #555;
        }
        input[type="file"]::file-selector-button {
            padding: 8px 16px;
            border: none;
            background-color: #e0e7ff; /* \u6DE1\u84DD\u8272\u80CC\u666F */
            color: #3730a3; /* \u6DF1\u84DD\u8272\u6587\u5B57 */
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
            margin-right: 10px;
        }
        input[type="file"]::file-selector-button:hover {
            background-color: #c7d2fe;
        }
        #upload-status {
            margin-top: 5px;
            font-weight: 500;
        }

        /* --- \u641C\u7D22\u6846\u7F8E\u5316 --- */
        #search-container {
            display: flex;
            gap: 8px; /* \u5143\u7D20\u95F4\u8DDD */
            margin-bottom: 15px;
        }
        #search-container input {
            flex-grow: 1; /* \u5360\u636E\u5269\u4F59\u7A7A\u95F4 */
            margin-bottom: 0; /* \u79FB\u9664 flex \u5E03\u5C40\u4E0B\u7684\u591A\u4F59\u95F4\u8DDD */
        }

        /* --- \u4E66\u7B7E\u5217\u8868\u7F8E\u5316 --- */
        #bookmarks-container {
            margin-top: 20px;
        }
        #bookmarks-list {
            list-style: none;
            padding: 0;
        }
        #bookmarks-list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 4px; /* \u8C03\u6574\u5185\u8FB9\u8DDD */
            border-bottom: 1px solid #eef2f7;
            transition: background-color 0.2s;
        }
        #bookmarks-list li:hover {
            background-color: #f8f9fa;
        }
        #bookmarks-list li span {
            cursor: pointer;
            color: #333;
            flex: 1;
        }
         #bookmarks-list li span:hover {
            color: #3B82F6;
         }
         #bookmarks-list li button {
             padding: 5px 10px;
             font-size: 12px;
             font-weight: 500;
             background-color: #e53e3e; /* \u7EA2\u8272\u6309\u94AE */
         }
         #bookmarks-list li button:hover {
             background-color: #c53030;
         }


        /* --- \u54CD\u5E94\u5F0F\u8BBE\u8BA1 (\u79FB\u52A8\u7AEF) --- */
        @media (max-width: 768px) {
            .container {
                /* \u5728\u79FB\u52A8\u7AEF\uFF0C\u51CF\u5C11\u5916\u8FB9\u8DDD\u548C\u5185\u8FB9\u8DDD */
                margin: 12px;
                padding: 16px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); /* \u4FDD\u6301\u4E00\u4E2A\u975E\u5E38\u5FAE\u5999\u7684\u9634\u5F71 */
            }

            h1 { font-size: 26px; }
            h2 { font-size: 22px; }
            h3 { font-size: 18px; }

            button,
            input[type="text"],
            input[type="password"] {
                /* \u7565\u5FAE\u51CF\u5C0F\u5B57\u4F53\u5927\u5C0F\uFF0C\u4EE5\u4FBF\u5728\u5C0F\u5C4F\u5E55\u4E0A\u5BB9\u7EB3\u66F4\u591A\u5185\u5BB9 */
                font-size: 15px;
                padding: 12px;
            }

            /* --- \u9605\u8BFB\u5668\u5934\u90E8\u54CD\u5E94\u5F0F --- */
            #viewer-header {
                flex-wrap: wrap; /* \u5141\u8BB8\u6362\u884C */
                gap: 10px;
                justify-content: space-between;
            }
            #book-title {
                flex-basis: 100%; /* \u6807\u9898\u5360\u636E\u4E00\u6574\u884C */
                order: 1; /* \u6392\u5E8F\uFF1A\u5C06\u6807\u9898\u653E\u5728\u4E2D\u95F4 */
                text-align: center;
                margin-bottom: 5px;
                padding-bottom: 5px; /* \u51CF\u5C11\u6807\u9898\u4E0B\u8FB9\u8DDD */
                border: none; /* \u79FB\u9664\u79FB\u52A8\u7AEF\u7684\u6807\u9898\u8FB9\u6846 */
            }
            #back-to-library-btn {
                order: 0; /* \u6392\u5E8F\uFF1A\u8FD4\u56DE\u6309\u94AE\u5728\u5DE6\u4E0A\u89D2 */
                padding: 8px 12px; /* \u51CF\u5C0F\u6309\u94AE\u5185\u8FB9\u8DDD */
                font-size: 14px;
            }
            #add-bookmark-btn {
                order: 2; /* \u6392\u5E8F\uFF1A\u6DFB\u52A0\u4E66\u7B7E\u5728\u53F3\u4E0A\u89D2 */
                padding: 8px 12px;
                font-size: 14px;
            }

            /* --- \u9605\u8BFB\u5668\u7FFB\u9875\u6309\u94AE --- */
            #prev, #next {
                /* \u5728\u79FB\u52A8\u7AEF\u7F29\u5C0F\u7FFB\u9875\u6309\u94AE\uFF0C\u51CF\u5C11\u5E72\u6270 */
                width: 38px;
                height: 38px;
                line-height: 38px;
                font-size: 18px;
                opacity: 0.6; /* \u4F7F\u5176\u66F4\u900F\u660E */
            }
            #prev { left: 10px; }
            #next { right: 10px; }

            /* \u79FB\u52A8\u7AEF\u60AC\u505C\uFF08\u70B9\u51FB\uFF09\u65F6\u624D\u5B8C\u5168\u663E\u793A */
            #prev:hover, #next:hover {
                opacity: 1;
            }

            /* --- \u641C\u7D22\u6846\u54CD\u5E94\u5F0F --- */
            #search-container {
                flex-direction: column; /* \u5782\u76F4\u5806\u53E0 */
                gap: 10px;
            }
            #search-container input {
                flex-grow: 0; /* \u79FB\u9664 flex-grow */
                width: calc(100% - 24px); /* \u786E\u4FDD\u5BBD\u5EA6\u6B63\u786E */
            }
            #search-container button {
                width: 100%; /* \u6309\u94AE\u5168\u5BBD */
            }

            /* --- \u4E0A\u4F20\u533A\u57DF --- */
            #upload-container {
                padding: 15px;
            }
            /* \u786E\u4FDD\u6587\u4EF6\u8F93\u5165\u6309\u94AE\u4E0D\u4F1A\u8FC7\u5927 */
            input[type="file"]::file-selector-button {
                padding: 8px 12px;
                font-size: 14px;
            }

            /* --- \u767B\u5F55\u8868\u5355 --- */
            #auth-view p {
                 font-size: 14px; /* \u7F29\u5C0F\u63D0\u793A\u6587\u5B57 */
            }
        }

        @media (max-width: 480px) {
            /* \u9488\u5BF9\u975E\u5E38\u5C0F\u7684\u5C4F\u5E55 */
            .container {
                margin: 0;
                padding: 12px;
                border-radius: 0; /* \u5C4F\u5E55\u8FB9\u7F18\u5230\u8FB9\u7F18 */
                box-shadow: none;
                min-height: 100vh; /* \u81F3\u5C11\u5360\u6EE1\u5168\u5C4F\u9AD8 */
                box-sizing: border-box; /* \u786E\u4FDD padding \u4E0D\u4F1A\u5BFC\u81F4\u6EA2\u51FA */
            }

            h1 { font-size: 22px; }
            h2 { font-size: 18px; }

            /* \u4F7F\u4E66\u7B7E\u5217\u8868\u4E2D\u7684\u5220\u9664\u6309\u94AE\u66F4\u6613\u4E8E\u70B9\u51FB */
            #bookmarks-list li button {
                padding: 8px 12px;
            }
        }

    </style>
</head>
<body>

    <div id="auth-view" class="container">
        <div id="login-form">
            <h1>\u767B\u5F55</h1>
            <input type="text" id="login-username" placeholder="\u7528\u6237\u540D">
            <input type="password" id="login-password" placeholder="\u5BC6\u7801">
            <button id="login-btn">\u767B\u5F55</button>
            <p>\u8FD8\u6CA1\u6709\u8D26\u6237\uFF1F <span class="auth-toggle" onclick="toggleAuthForms()">\u5728\u6B64\u6CE8\u518C\u3002</span></p>
        </div>
        <div id="register-form" class="hidden">
            <h1>\u6CE8\u518C</h1>
            <input type="text" id="register-username" placeholder="\u7528\u6237\u540D">
            <input type="password" id="register-password" placeholder="\u5BC6\u7801">
            <button id="register-btn">\u6CE8\u518C</button>
            <p>\u5DF2\u6709\u8D26\u6237\uFF1F <span class="auth-toggle" onclick="toggleAuthForms()">\u5728\u6B64\u767B\u5F55\u3002</span></p>
        </div>
        <p id="auth-error" style="color: red;"></p>
    </div>

    <div id="main-view" class="container hidden">
        <div id="admin-panel" class="hidden">
            <h2>\u7BA1\u7406\u5458\uFF1AWebDAV \u914D\u7F6E</h2>
            <input type="text" id="webdav-url" placeholder="WebDAV \u94FE\u63A5">
            <input type="text" id="webdav-username" placeholder="WebDAV \u7528\u6237\u540D">
            <input type="password" id="webdav-password" placeholder="WebDAV \u5BC6\u7801">
            <button id="webdav-save-btn">\u4FDD\u5B58\u914D\u7F6E</button>
            <p id="webdav-status" style="color: green;"></p>
        </div>

        <div id="book-list">
            <h2>\u6211\u7684\u4E66\u7C4D</h2>
            <div id="upload-container">
                <input type="file" id="epub-upload-input" accept=".epub">
                <button id="upload-btn">\u4E0A\u4F20\u4E66\u7C4D</button>
                <p id="upload-status" style="margin-top: 5px;"></p>
            </div>

            <div id="search-container">
                <input type="text" id="search-input" placeholder="\u641C\u7D22\u4E66\u7C4D...">
                <button id="search-btn">\u641C\u7D22</button>
                <button id="clear-search-btn" class="button-secondary">\u6E05\u9664\u641C\u7D22</button>
            </div>
            <ul id="books"></ul>
        </div>

        <div id="viewer-container" class="hidden">
            <div id="viewer-header">
                <button id="back-to-library-btn" class="button-secondary">&larr; \u8FD4\u56DE\u4E66\u5E93</button>
                <h3 id="book-title" style="text-align: center; flex-grow: 1; margin: 0 15px; border: none; padding: 0;"></h3>
                <button id="add-bookmark-btn">\u6DFB\u52A0\u4E66\u7B7E</button>
            </div>
            <div id="viewer-wrapper" style="position: relative;">
                 <div id="viewer"></div>
                 <button id="prev">&lt;</button>
                 <button id="next">&gt;</button>
            </div>
            <div id="bookmarks-container">
                <h4>\u4E66\u7B7E</h4>
                <ul id="bookmarks-list"></ul>
            </div>
        </div>
    </div>

<script>
    // --- DOM Elements ---
    const authView = document.getElementById('auth-view');
    const mainView = document.getElementById('main-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const adminPanel = document.getElementById('admin-panel');
    const bookList = document.getElementById('book-list');
    const viewerContainer = document.getElementById('viewer-container');
    const bookTitle = document.getElementById('book-title');
    const authError = document.getElementById('auth-error');
    const booksUl = document.getElementById('books'); // Cache books UL

    let book, rendition;
    let currentBookPath = null;
    let initialAuthCheckDone = false; // Flag to ensure initial check runs only once

    // --- Debounce Helper ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- API Helper ---
    async function api(endpoint, options = {}) {
        const response = await fetch('/api' + endpoint, options);
        if (!response.ok) {
            // Try to parse JSON error, fallback to status text
            let errorData = { error: \`\u8BF7\u6C42\u5931\u8D25\uFF0C\u72B6\u6001\u7801\uFF1A\${response.status} \${response.statusText}\` };
            try {
                errorData = await response.json();
            } catch (e) { /* ignore json parsing error */ }
            throw new Error(errorData.error || \`\u8BF7\u6C42\u5931\u8D25\uFF0C\u72B6\u6001\u7801\uFF1A\${response.status}\`);
        }
        if (response.headers.get('Content-Type')?.includes('application/json')) {
            return response.json();
        }
        return response; // Return response for non-JSON cases like book streaming
    }


    // --- Auth Logic ---
    function toggleAuthForms() {
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
        authError.textContent = '';
    }

    document.getElementById('login-btn').addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        authError.textContent = ''; // Clear previous errors
        try {
            // *** CHANGE: Login API call now returns isAdmin status ***
            const loginResult = await api('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            // *** Login successful, switch view immediately ***
            showMainView(loginResult.isAdmin);
        } catch (error) {
            authError.textContent = error.message;
        }
    });

    document.getElementById('register-btn').addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        authError.textContent = ''; // Clear previous errors
        try {
            await api('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            alert('\u6CE8\u518C\u6210\u529F\uFF01\u8BF7\u767B\u5F55\u3002');
            toggleAuthForms();
        } catch (error) {
            authError.textContent = error.message;
        }
    });

    // --- NEW: Function to show main view after successful auth check/login ---
    async function showMainView(isAdmin) {
        authView.classList.add('hidden');
        mainView.classList.remove('hidden');

        // Setup admin panel if user is admin
        if (isAdmin) {
            setupAdminPanel(); // Safe to call even if already set up
        }

        // Load books, handling potential WebDAV config errors
        await loadBooks();
    }

    // --- Debounced Save Progress Function ---
    const saveProgress = debounce(async (bookId, cfi) => {
        if (!bookId || !cfi) return;
        console.log("\u6B63\u5728\u4FDD\u5B58\u8FDB\u5EA6...", cfi);
        try {
            await api('/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_identifier: bookId, cfi: cfi })
            });
        } catch (error) {
            console.error('\u4FDD\u5B58\u8FDB\u5EA6\u5931\u8D25:', error);
        }
    }, 2000); // Save every 2 seconds max


    // --- Book & Reader Logic (MODIFIED to handle errors gracefully) ---
    async function loadBooks(query = '') {
        const booksUl = document.getElementById('books'); // Use cached element
        booksUl.innerHTML = '<li class="info-message">\u52A0\u8F7D\u4E66\u7C4D\u4E2D...</li>'; // Loading message

        try {
            const endpoint = query ? \`/books?q=\${encodeURIComponent(query)}\` : '/books';
            const books = await api(endpoint);

            booksUl.innerHTML = ''; // Clear loading/previous messages
            if (books.length === 0) {
                const message = query
                    ? \`<li>\u672A\u627E\u5230\u4E0E\u201C\${query}\u201D\u5339\u914D\u7684\u4E66\u7C4D\u3002</li>\`
                    : '<li class="info-message">WebDAV \u670D\u52A1\u5668\u4E0A\u672A\u627E\u5230 EPUB \u4E66\u7C4D\uFF0C\u6216\u5C1A\u672A\u914D\u7F6E\u3002</li>'; // Update message
                booksUl.innerHTML = message;
            } else {
                books.forEach(bookItem => {
                    const li = document.createElement('li');
                    li.textContent = bookItem.name;
                    li.onclick = () => openBook(bookItem.path, bookItem.name);
                    booksUl.appendChild(li);
                });
            }
        } catch (error) {
            console.error('\u52A0\u8F7D\u4E66\u7C4D\u51FA\u9519:', error);
             // *** CHANGE: Display specific error messages ***
             let errorMessage = \`<li>\u52A0\u8F7D\u4E66\u7C4D\u65F6\u53D1\u751F\u9519\u8BEF\u3002</li>\`;
             if (error.message.includes('WebDAV service is not configured')) {
                 errorMessage = \`<li class="info-message">\u8BF7\u5148\u5728\u7BA1\u7406\u5458\u9762\u677F\u4E2D\u914D\u7F6E WebDAV \u670D\u52A1\u3002</li>\`;
             } else if (error.message.includes('WebDAV authentication failed')) {
                  errorMessage = \`<li class="info-message">WebDAV \u8BA4\u8BC1\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7BA1\u7406\u5458\u914D\u7F6E\u3002</li>\`;
             } else if (error.message.includes('\u8BF7\u6C42\u5931\u8D25\uFF0C\u72B6\u6001\u7801\uFF1A401')) {
                  // This might happen if the token expires while loading books
                  // Redirect to login
                  showAuthView();
                  return; // Stop further execution in this case
             }
             booksUl.innerHTML = errorMessage;
        }
    }


    // --- Search Logic ---
    document.getElementById('search-btn').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        loadBooks(query);
    });

    document.getElementById('clear-search-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        loadBooks();
    });

    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadBooks(e.target.value);
        }
    });

    // --- Upload Logic ---
    document.getElementById('upload-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('epub-upload-input');
        const statusEl = document.getElementById('upload-status');
        const file = fileInput.files[0];

        if (!file) {
            statusEl.textContent = '\u8BF7\u9009\u62E9\u8981\u4E0A\u4F20\u7684\u6587\u4EF6\u3002';
            statusEl.style.color = 'red';
            return;
        }

        if (!file.name.toLowerCase().endsWith('.epub')) {
            statusEl.textContent = '\u6587\u4EF6\u7C7B\u578B\u65E0\u6548\u3002\u53EA\u5141\u8BB8\u4E0A\u4F20 .epub \u6587\u4EF6\u3002';
            statusEl.style.color = 'red';
            return;
        }

        statusEl.textContent = '\u4E0A\u4F20\u4E2D...';
        statusEl.style.color = 'blue';

        const formData = new FormData();
        formData.append('book', file);

        try {
            const response = await fetch('/api/upload', { // Use fetch directly for FormData
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle potential 401 Unauthorized during upload if token expired
                if (response.status === 401) {
                     showAuthView();
                     throw new Error('\u8BA4\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002');
                }
                throw new Error(result.error || '\u672A\u77E5\u4E0A\u4F20\u9519\u8BEF');
            }

            statusEl.textContent = '\u4E0A\u4F20\u6210\u529F\uFF01';
            statusEl.style.color = 'green';
            fileInput.value = ''; // Clear the input
            await loadBooks(); // Refresh the book list
        } catch (error) {
            statusEl.textContent = \`\u9519\u8BEF\uFF1A\${error.message}\`;
            statusEl.style.color = 'red';
        }
    });


    async function openBook(path, name) {
        currentBookPath = path;
        bookTitle.textContent = name;

        bookList.classList.add('hidden');
        viewerContainer.classList.remove('hidden');

        // *** \u5173\u952E\u4FEE\u590D\uFF1A\u76F4\u63A5\u5C06 URL \u4F20\u9012\u7ED9 ePub.js\uFF0C\u8BA9\u5176\u5904\u7406 fetching ***
        // \u8FD9\u6837\u53EF\u4EE5\u786E\u4FDD\u4E66\u7C4D\u5185\u90E8\u7684\u8D44\u6E90\uFF08\u5982 CSS\u3001\u56FE\u7247\uFF09\u80FD\u88AB\u6B63\u786E\u52A0\u8F7D\u3002
        book = ePub(\`/api/book\${path}\`);
        rendition = book.renderTo("viewer", { width: "100%", height: "100%" });

        let startCfi = undefined;
        try {
            const progress = await api(\`/progress\${path}\`);
            startCfi = progress.cfi;
            console.log('\u4ECE\u6B64\u5904\u6062\u590D:', startCfi);
        } catch (e) {
             if (e.message.includes('401')) {
                  showAuthView();
                  alert('\u83B7\u53D6\u9605\u8BFB\u8FDB\u5EA6\u5931\u8D25\uFF1A\u8BA4\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002');
                  closeBook();
                  return;
             }
            console.log('\u672A\u627E\u5230\u4FDD\u5B58\u7684\u8FDB\u5EA6\uFF0C\u4ECE\u5934\u5F00\u59CB\u3002');
        }

        // *** \u5173\u952E\u4FEE\u590D\uFF1A\u5305\u88F9 display \u8C03\u7528\u4EE5\u6355\u83B7\u52A0\u8F7D/\u6E32\u67D3\u9519\u8BEF ***
        try {
            await rendition.display(startCfi);
        } catch (err) {
            console.error("\u52A0\u8F7D\u6216\u6E32\u67D3\u4E66\u7C4D\u65F6\u51FA\u9519:", err);
            // \u5C1D\u8BD5\u5904\u7406 fetch response \u9519\u8BEF\u5BF9\u8C61
            if (err && err.status) {
                const bookResponse = err;
                if (bookResponse.status === 401) {
                    showAuthView();
                    alert('\u52A0\u8F7D\u4E66\u7C4D\u5931\u8D25\uFF1A\u8BA4\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002');
                } else if (bookResponse.status === 404) {
                    alert(\`\u52A0\u8F7D\u4E66\u7C4D\u5931\u8D25\uFF1A\u672A\u627E\u5230\u6587\u4EF6 (\${path})\`);
                } else if (bookResponse.status === 503) {
                    alert('\u52A0\u8F7D\u4E66\u7C4D\u5931\u8D25\uFF1AWebDAV \u670D\u52A1\u4E0D\u53EF\u7528\u6216\u672A\u914D\u7F6E\u3002');
                } else {
                    alert(\`\u52A0\u8F7D\u4E66\u7C4D\u5931\u8D25\uFF0C\u72B6\u6001\u7801\uFF1A\${bookResponse.status}\`);
                }
            } else {
                // \u5904\u7406\u5176\u4ED6\u901A\u7528\u9519\u8BEF
                alert(\`\u52A0\u8F7D\u4E66\u7C4D\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF\u3002\u8BF7\u68C0\u67E5\u63A7\u5236\u53F0\u83B7\u53D6\u8BE6\u7EC6\u4FE1\u606F\u3002\`);
            }
            closeBook();
            return;
        }

        rendition.on("relocated", (location) => {
            const cfi = location.start.cfi;
            saveProgress(path, cfi);
        });

        document.getElementById('prev').onclick = () => rendition.prev();
        document.getElementById('next').onclick = () => rendition.next();

        await loadBookmarks(path);
    }

    function closeBook() {
        if (book) {
            book.destroy();
            book = null;
            rendition = null;
        }
        currentBookPath = null;
        viewerContainer.classList.add('hidden');
        bookList.classList.remove('hidden');
         // Refresh book list in case a book failed to load or WebDAV became available
         loadBooks();
    }

    document.getElementById('back-to-library-btn').addEventListener('click', closeBook);

    // --- Bookmark Logic ---
    async function loadBookmarks(bookId) {
        const list = document.getElementById('bookmarks-list');
        list.innerHTML = '<li>\u52A0\u8F7D\u4E2D...</li>';
        try {
            const bookmarks = await api(\`/bookmarks\${bookId}\`);
            list.innerHTML = '';
            if (bookmarks.length === 0) {
                list.innerHTML = '<li>\u6682\u65E0\u4E66\u7B7E\u3002</li>';
            } else {
                bookmarks.forEach(bm => {
                    const li = document.createElement('li');
                    const text = document.createElement('span');
                    text.textContent = bm.label || \`\u4E66\u7B7E \${new Date(bm.created_at).toLocaleDateString()}\`;
                    text.onclick = () => rendition.display(bm.cfi);

                    const delBtn = document.createElement('button');
                    delBtn.textContent = '\u5220\u9664';
                    delBtn.onclick = (e) => {
                        e.stopPropagation();
                        deleteBookmark(bm.id, bookId);
                    };

                    li.appendChild(text);
                    li.appendChild(delBtn);
                    list.appendChild(li);
                });
            }
        } catch (error) {
            console.error('\u65E0\u6CD5\u52A0\u8F7D\u4E66\u7B7E\uFF1A', error);
             if (error.message.includes('401')) { // Handle potential 401
                  showAuthView();
                  alert('\u52A0\u8F7D\u4E66\u7B7E\u5931\u8D25\uFF1A\u8BA4\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002');
                  return;
             }
            list.innerHTML = '<li>\u52A0\u8F7D\u4E66\u7B7E\u65F6\u51FA\u9519\u3002</li>';
        }
    }

    async function addBookmark() {
        if (!rendition || !currentBookPath) return;

        const cfi = rendition.currentLocation().start.cfi;
        const label = prompt("\u4E3A\u6B64\u4E66\u7B7E\u8F93\u5165\u4E00\u4E2A\u6807\u7B7E\uFF08\u53EF\u9009\uFF09\uFF1A");

        try {
            await api('/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_identifier: currentBookPath,
                    cfi: cfi,
                    label: label
                })
            });
            await loadBookmarks(currentBookPath);
        } catch (error) {
            console.error("\u65E0\u6CD5\u6DFB\u52A0\u4E66\u7B7E\uFF1A", error);
             if (error.message.includes('401')) { // Handle potential 401
                  showAuthView();
                  alert('\u6DFB\u52A0\u4E66\u7B7E\u5931\u8D25\uFF1A\u8BA4\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002');
                  return;
             }
            alert("\u9519\u8BEF\uFF1A" + error.message);
        }
    }
    document.getElementById('add-bookmark-btn').addEventListener('click', addBookmark);

    async function deleteBookmark(bookmarkId, bookId) {
        if (!confirm('\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u4E66\u7B7E\u5417\uFF1F')) return;
        try {
            await api(\`/bookmark/\${bookmarkId}\`, { method: 'DELETE' });
            await loadBookmarks(bookId);
        } catch (error) {
             console.error("\u65E0\u6CD5\u5220\u9664\u4E66\u7B7E\uFF1A", error);
              if (error.message.includes('401')) { // Handle potential 401
                  showAuthView();
                  alert('\u5220\u9664\u4E66\u7B7E\u5931\u8D25\uFF1A\u8BA4\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002');
                  return;
             }
            alert("\u9519\u8BEF\uFF1A" + error.message);
        }
    }


    // --- Admin Logic ---
    async function setupAdminPanel() {
        // Only show if not already visible to avoid redundant calls
        if (adminPanel.classList.contains('hidden')) {
            adminPanel.classList.remove('hidden');
            const saveBtn = document.getElementById('webdav-save-btn');
            const statusEl = document.getElementById('webdav-status');

            // Load existing config if available
            try {
                // *** Use api helper which handles errors and potential 401 ***
                const config = await api('/admin/webdav');
                document.getElementById('webdav-url').value = config.url || '';
                document.getElementById('webdav-username').value = config.username || '';
            } catch (error) {
                 // If 401, redirect to login
                 if (error.message.includes('401')) {
                      showAuthView();
                      return;
                 }
                // It's ok if it fails (e.g., 404 if not configured), means no config yet.
                console.log("\u83B7\u53D6 WebDAV \u914D\u7F6E\u5931\u8D25\uFF08\u53EF\u80FD\u662F\u9996\u6B21\u914D\u7F6E\uFF09\uFF1A", error.message);
            }

            // Add event listener only once
            if (!saveBtn.dataset.listenerAttached) {
                 saveBtn.addEventListener('click', async () => {
                    const url = document.getElementById('webdav-url').value;
                    const username = document.getElementById('webdav-username').value;
                    const password = document.getElementById('webdav-password').value;
                    statusEl.textContent = '\u4FDD\u5B58\u4E2D...';
                    statusEl.style.color = 'blue';
                    try {
                         // *** Use api helper ***
                        await api('/admin/webdav', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url, username, password })
                        });
                        statusEl.textContent = '\u914D\u7F6E\u5DF2\u4FDD\u5B58\uFF01';
                        statusEl.style.color = 'green';
                        document.getElementById('webdav-password').value = ''; // Clear password field
                        setTimeout(() => statusEl.textContent = '', 3000);
                        await loadBooks(); // Reload books after config change
                    } catch (error) {
                        statusEl.textContent = '\u9519\u8BEF\uFF1A' + error.message;
                        statusEl.style.color = 'red';
                    }
                });
                saveBtn.dataset.listenerAttached = 'true';
            }
        }
    }

    // --- NEW: Function to explicitly show auth view and hide main view ---
    function showAuthView() {
        mainView.classList.add('hidden');
        authView.classList.remove('hidden');
        // Clear sensitive info potentially left in inputs if needed
        document.getElementById('login-password').value = '';
        document.getElementById('register-password').value = '';
        if (document.getElementById('webdav-password')) {
            document.getElementById('webdav-password').value = '';
        }
    }


    // --- Initialization (Revised) ---
    async function checkInitialAuth() {
        if (initialAuthCheckDone) return; // Prevent multiple checks on hot reloads
        initialAuthCheckDone = true;

        // Try accessing a protected endpoint to see if the cookie is valid
        try {
            // Use /api/admin/webdav as it requires auth and tells us if user is admin
            const response = await fetch('/api/admin/webdav'); // Use raw fetch to check status

            if (response.ok) {
                // User is logged in and is an admin
                showMainView(true);
            } else if (response.status === 403) {
                // User is logged in but NOT an admin
                // Still try to show main view, but don't setup admin panel
                // We need another simple protected endpoint for non-admins
                // For now, let's try /api/books (it requires auth but might fail)
                 try {
                     const booksCheck = await fetch('/api/books');
                     if (booksCheck.status !== 401) { // Any status other than 401 means logged in
                         showMainView(false);
                     } else {
                         showAuthView(); // If booksCheck is 401, definitely not logged in
                     }
                 } catch (e) {
                     // Network error during books check, assume not logged in for safety
                     showAuthView();
                 }

            } else {
                // Any other error (like 401 Unauthorized) means not logged in
                showAuthView();
            }
        } catch (error) {
            // Network error during initial check, assume not logged in
            console.error("Initial auth check failed:", error);
            showAuthView();
        }
    }


    // Run initial auth check on page load
    checkInitialAuth();

<\/script>
</body>
</html>`;

// src/index.js
var app = new Hono2();
app.get("/", (c2) => {
  return c2.html(public_default);
});
app.get("/epub.min.js", (c2) => {
  if (false) {
    console.error("EPUB_JS_CONTENT \u672A\u5B9A\u4E49\u3002\u6784\u5EFA\u6B65\u9AA4\u53EF\u80FD\u5931\u8D25\u6216\u914D\u7F6E\u9519\u8BEF\u3002");
    return c2.text("// \u9519\u8BEF\uFF1A\u672A\u627E\u5230 epub.min.js \u5185\u5BB9\u3002", 500, { "Content-Type": "application/javascript" });
  }
  return c2.text(`!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("JSZip")):"function"==typeof define&&define.amd?define(["JSZip"],e):"object"==typeof exports?exports.ePub=e(require("JSZip")):t.ePub=e(t.JSZip)}(window,(function(t){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(n,s,function(e){return t[e]}.bind(null,s));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="/dist/",i(i.s=30)}([function(t,e,i){"use strict";i.r(e),i.d(e,"requestAnimationFrame",(function(){return s})),i.d(e,"uuid",(function(){return o})),i.d(e,"documentHeight",(function(){return a})),i.d(e,"isElement",(function(){return h})),i.d(e,"isNumber",(function(){return l})),i.d(e,"isFloat",(function(){return c})),i.d(e,"prefixed",(function(){return u})),i.d(e,"defaults",(function(){return d})),i.d(e,"extend",(function(){return f})),i.d(e,"insert",(function(){return p})),i.d(e,"locationOf",(function(){return g})),i.d(e,"indexOfSorted",(function(){return m})),i.d(e,"bounds",(function(){return v})),i.d(e,"borders",(function(){return y})),i.d(e,"nodeBounds",(function(){return b})),i.d(e,"windowBounds",(function(){return w})),i.d(e,"indexOfNode",(function(){return x})),i.d(e,"indexOfTextNode",(function(){return E})),i.d(e,"indexOfElementNode",(function(){return S})),i.d(e,"isXml",(function(){return N})),i.d(e,"createBlob",(function(){return _})),i.d(e,"createBlobUrl",(function(){return T})),i.d(e,"revokeBlobUrl",(function(){return C})),i.d(e,"createBase64Url",(function(){return O})),i.d(e,"type",(function(){return I})),i.d(e,"parse",(function(){return R})),i.d(e,"qs",(function(){return k})),i.d(e,"qsa",(function(){return A})),i.d(e,"qsp",(function(){return L})),i.d(e,"sprint",(function(){return j})),i.d(e,"treeWalker",(function(){return D})),i.d(e,"walk",(function(){return P})),i.d(e,"blob2base64",(function(){return M})),i.d(e,"defer",(function(){return z})),i.d(e,"querySelectorByType",(function(){return B})),i.d(e,"findChildren",(function(){return q})),i.d(e,"parents",(function(){return F})),i.d(e,"filterChildren",(function(){return U})),i.d(e,"getParentByTagName",(function(){return W})),i.d(e,"RangeObject",(function(){return H}));var n=i(15);const s="undefined"!=typeof window&&(window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame),r="undefined"!=typeof URL?URL:"undefined"!=typeof window?window.URL||window.webkitURL||window.mozURL:void 0;function o(){var t=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var i=(t+16*Math.random())%16|0;return t=Math.floor(t/16),("x"==e?i:7&i|8).toString(16)}))}function a(){return Math.max(document.documentElement.clientHeight,document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight,document.documentElement.offsetHeight)}function h(t){return!(!t||1!=t.nodeType)}function l(t){return!isNaN(parseFloat(t))&&isFinite(t)}function c(t){let e=parseFloat(t);return!1!==l(t)&&("string"==typeof t&&t.indexOf(".")>-1||Math.floor(e)!==e)}function u(t){var e=["-webkit-","-webkit-","-moz-","-o-","-ms-"],i=t.toLowerCase(),n=["Webkit","webkit","Moz","O","ms"].length;if("undefined"==typeof document||void 0!==document.body.style[i])return t;for(var s=0;s<n;s++)if(void 0!==document.body.style[e[s]+i])return e[s]+i;return t}function d(t){for(var e=1,i=arguments.length;e<i;e++){var n=arguments[e];for(var s in n)void 0===t[s]&&(t[s]=n[s])}return t}function f(t){var e=[].slice.call(arguments,1);return e.forEach((function(e){e&&Object.getOwnPropertyNames(e).forEach((function(i){Object.defineProperty(t,i,Object.getOwnPropertyDescriptor(e,i))}))})),t}function p(t,e,i){var n=g(t,e,i);return e.splice(n,0,t),n}function g(t,e,i,n,s){var r,o=n||0,a=s||e.length,h=parseInt(o+(a-o)/2);return i||(i=function(t,e){return t>e?1:t<e?-1:t==e?0:void 0}),a-o<=0?h:(r=i(e[h],t),a-o==1?r>=0?h:h+1:0===r?h:-1===r?g(t,e,i,h,a):g(t,e,i,o,h))}function m(t,e,i,n,s){var r,o=n||0,a=s||e.length,h=parseInt(o+(a-o)/2);return i||(i=function(t,e){return t>e?1:t<e?-1:t==e?0:void 0}),a-o<=0?-1:(r=i(e[h],t),a-o==1?0===r?h:-1:0===r?h:-1===r?m(t,e,i,h,a):m(t,e,i,o,h))}function v(t){var e=window.getComputedStyle(t),i=0,n=0;return["width","paddingRight","paddingLeft","marginRight","marginLeft","borderRightWidth","borderLeftWidth"].forEach((function(t){i+=parseFloat(e[t])||0})),["height","paddingTop","paddingBottom","marginTop","marginBottom","borderTopWidth","borderBottomWidth"].forEach((function(t){n+=parseFloat(e[t])||0})),{height:n,width:i}}function y(t){var e=window.getComputedStyle(t),i=0,n=0;return["paddingRight","paddingLeft","marginRight","marginLeft","borderRightWidth","borderLeftWidth"].forEach((function(t){i+=parseFloat(e[t])||0})),["paddingTop","paddingBottom","marginTop","marginBottom","borderTopWidth","borderBottomWidth"].forEach((function(t){n+=parseFloat(e[t])||0})),{height:n,width:i}}function b(t){let e,i=t.ownerDocument;if(t.nodeType==Node.TEXT_NODE){let n=i.createRange();n.selectNodeContents(t),e=n.getBoundingClientRect()}else e=t.getBoundingClientRect();return e}function w(){var t=window.innerWidth,e=window.innerHeight;return{top:0,left:0,right:t,bottom:e,width:t,height:e}}function x(t,e){for(var i,n=t.parentNode.childNodes,s=-1,r=0;r<n.length&&((i=n[r]).nodeType===e&&s++,i!=t);r++);return s}function E(t){return x(t,3)}function S(t){return x(t,1)}function N(t){return["xml","opf","ncx"].indexOf(t)>-1}function _(t,e){return new Blob([t],{type:e})}function T(t,e){var i=_(t,e);return r.createObjectURL(i)}function C(t){return r.revokeObjectURL(t)}function O(t,e){if("string"==typeof t)return"data:"+e+";base64,"+btoa(t)}function I(t){return Object.prototype.toString.call(t).slice(8,-1)}function R(t,e,i){var s;return s="undefined"==typeof DOMParser||i?n.DOMParser:DOMParser,65279===t.charCodeAt(0)&&(t=t.slice(1)),(new s).parseFromString(t,e)}function k(t,e){var i;if(!t)throw new Error("No Element Provided");return void 0!==t.querySelector?t.querySelector(e):(i=t.getElementsByTagName(e)).length?i[0]:void 0}function A(t,e){return void 0!==t.querySelector?t.querySelectorAll(e):t.getElementsByTagName(e)}function L(t,e,i){var n,s;if(void 0!==t.querySelector){for(var r in e+="[",i)e+=r+"~='"+i[r]+"'";return e+="]",t.querySelector(e)}if(n=t.getElementsByTagName(e),s=Array.prototype.slice.call(n,0).filter((function(t){for(var e in i)if(t.getAttribute(e)===i[e])return!0;return!1})))return s[0]}function j(t,e){void 0!==(t.ownerDocument||t).createTreeWalker?D(t,e,NodeFilter.SHOW_TEXT):P(t,(function(t){t&&3===t.nodeType&&e(t)}))}function D(t,e,i){var n=document.createTreeWalker(t,i,null,!1);let s;for(;s=n.nextNode();)e(s)}function P(t,e){if(e(t))return!0;if(t=t.firstChild)do{if(P(t,e))return!0;t=t.nextSibling}while(t)}function M(t){return new Promise((function(e,i){var n=new FileReader;n.readAsDataURL(t),n.onloadend=function(){e(n.result)}}))}function z(){this.resolve=null,this.reject=null,this.id=o(),this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e}),Object.freeze(this)}function B(t,e,i){var n;if(void 0!==t.querySelector&&(n=t.querySelector(\`\${e}[*|type="\${i}"]\`)),n&&0!==n.length)return n;n=A(t,e);for(var s=0;s<n.length;s++)if(n[s].getAttributeNS("http://www.idpf.org/2007/ops","type")===i||n[s].getAttribute("epub:type")===i)return n[s]}function q(t){for(var e=[],i=t.childNodes,n=0;n<i.length;n++){let t=i[n];1===t.nodeType&&e.push(t)}return e}function F(t){for(var e=[t];t;t=t.parentNode)e.unshift(t);return e}function U(t,e,i){for(var n=[],s=t.childNodes,r=0;r<s.length;r++){let t=s[r];if(1===t.nodeType&&t.nodeName.toLowerCase()===e){if(i)return t;n.push(t)}}if(!i)return n}function W(t,e){let i;if(null!==t&&""!==e)for(i=t.parentNode;1===i.nodeType;){if(i.tagName.toLowerCase()===e)return i;i=i.parentNode}}class H{constructor(){this.collapsed=!1,this.commonAncestorContainer=void 0,this.endContainer=void 0,this.endOffset=void 0,this.startContainer=void 0,this.startOffset=void 0}setStart(t,e){this.startContainer=t,this.startOffset=e,this.endContainer?this.commonAncestorContainer=this._commonAncestorContainer():this.collapse(!0),this._checkCollapsed()}setEnd(t,e){this.endContainer=t,this.endOffset=e,this.startContainer?(this.collapsed=!1,this.commonAncestorContainer=this._commonAncestorContainer()):this.collapse(!1),this._checkCollapsed()}collapse(t){this.collapsed=!0,t?(this.endContainer=this.startContainer,this.endOffset=this.startOffset,this.commonAncestorContainer=this.startContainer.parentNode):(this.startContainer=this.endContainer,this.startOffset=this.endOffset,this.commonAncestorContainer=this.endOffset.parentNode)}selectNode(t){let e=t.parentNode,i=Array.prototype.indexOf.call(e.childNodes,t);this.setStart(e,i),this.setEnd(e,i+1)}selectNodeContents(t){t.childNodes[t.childNodes-1];let e=3===t.nodeType?t.textContent.length:parent.childNodes.length;this.setStart(t,0),this.setEnd(t,e)}_commonAncestorContainer(t,e){var i=F(t||this.startContainer),n=F(e||this.endContainer);if(i[0]==n[0])for(var s=0;s<i.length;s++)if(i[s]!=n[s])return i[s-1]}_checkCollapsed(){this.startContainer===this.endContainer&&this.startOffset===this.endOffset?this.collapsed=!0:this.collapsed=!1}toString(){}}},function(t,e,i){"use strict";i.d(e,"b",(function(){return n})),i.d(e,"a",(function(){return s})),i.d(e,"c",(function(){return r}));const n="0.3",s=["keydown","keyup","keypressed","mouseup","mousedown","mousemove","click","touchend","touchstart","touchmove"],r={BOOK:{OPEN_FAILED:"openFailed"},CONTENTS:{EXPAND:"expand",RESIZE:"resize",SELECTED:"selected",SELECTED_RANGE:"selectedRange",LINK_CLICKED:"linkClicked"},LOCATIONS:{CHANGED:"changed"},MANAGERS:{RESIZE:"resize",RESIZED:"resized",ORIENTATION_CHANGE:"orientationchange",ADDED:"added",SCROLL:"scroll",SCROLLED:"scrolled",REMOVED:"removed"},VIEWS:{AXIS:"axis",WRITING_MODE:"writingMode",LOAD_ERROR:"loaderror",RENDERED:"rendered",RESIZED:"resized",DISPLAYED:"displayed",SHOWN:"shown",HIDDEN:"hidden",MARK_CLICKED:"markClicked"},RENDITION:{STARTED:"started",ATTACHED:"attached",DISPLAYED:"displayed",DISPLAY_ERROR:"displayerror",RENDERED:"rendered",REMOVED:"removed",RESIZED:"resized",ORIENTATION_CHANGE:"orientationchange",LOCATION_CHANGED:"locationChanged",RELOCATED:"relocated",MARK_CLICKED:"markClicked",SELECTED:"selected",LAYOUT:"layout"},LAYOUT:{UPDATED:"updated"},ANNOTATION:{ATTACH:"attach",DETACH:"detach"}}},function(t,e,i){"use strict";var n=i(0);class s{constructor(t,e,i){var r;if(this.str="",this.base={},this.spinePos=0,this.range=!1,this.path={},this.start=null,this.end=null,!(this instanceof s))return new s(t,e,i);if("string"==typeof e?this.base=this.parseComponent(e):"object"==typeof e&&e.steps&&(this.base=e),"string"===(r=this.checkType(t)))return this.str=t,Object(n.extend)(this,this.parse(t));if("range"===r)return Object(n.extend)(this,this.fromRange(t,this.base,i));if("node"===r)return Object(n.extend)(this,this.fromNode(t,this.base,i));if("EpubCFI"===r&&t.path)return t;if(t)throw new TypeError("not a valid argument for EpubCFI");return this}checkType(t){return this.isCfiString(t)?"string":!t||"object"!=typeof t||"Range"!==Object(n.type)(t)&&void 0===t.startContainer?t&&"object"==typeof t&&void 0!==t.nodeType?"node":!!(t&&"object"==typeof t&&t instanceof s)&&"EpubCFI":"range"}parse(t){var e,i,n,s={spinePos:-1,range:!1,base:{},path:{},start:null,end:null};return"string"!=typeof t?{spinePos:-1}:(0===t.indexOf("epubcfi(")&&")"===t[t.length-1]&&(t=t.slice(8,t.length-1)),(e=this.getChapterComponent(t))?(s.base=this.parseComponent(e),i=this.getPathComponent(t),s.path=this.parseComponent(i),(n=this.getRange(t))&&(s.range=!0,s.start=this.parseComponent(n[0]),s.end=this.parseComponent(n[1])),s.spinePos=s.base.steps[1].index,s):{spinePos:-1})}parseComponent(t){var e,i={steps:[],terminal:{offset:null,assertion:null}},n=t.split(":"),s=n[0].split("/");return n.length>1&&(e=n[1],i.terminal=this.parseTerminal(e)),""===s[0]&&s.shift(),i.steps=s.map(function(t){return this.parseStep(t)}.bind(this)),i}parseStep(t){var e,i,n,s,r;if((s=t.match(/\\[(.*)\\]/))&&s[1]&&(r=s[1]),i=parseInt(t),!isNaN(i))return i%2==0?(e="element",n=i/2-1):(e="text",n=(i-1)/2),{type:e,index:n,id:r||null}}parseTerminal(t){var e,i,s=t.match(/\\[(.*)\\]/);return s&&s[1]?(e=parseInt(t.split("[")[0]),i=s[1]):e=parseInt(t),Object(n.isNumber)(e)||(e=null),{offset:e,assertion:i}}getChapterComponent(t){return t.split("!")[0]}getPathComponent(t){var e=t.split("!");if(e[1]){return e[1].split(",")[0]}}getRange(t){var e=t.split(",");return 3===e.length&&[e[1],e[2]]}getCharecterOffsetComponent(t){return t.split(":")[1]||""}joinSteps(t){return t?t.map((function(t){var e="";return"element"===t.type&&(e+=2*(t.index+1)),"text"===t.type&&(e+=1+2*t.index),t.id&&(e+="["+t.id+"]"),e})).join("/"):""}segmentString(t){var e="/";return e+=this.joinSteps(t.steps),t.terminal&&null!=t.terminal.offset&&(e+=":"+t.terminal.offset),t.terminal&&null!=t.terminal.assertion&&(e+="["+t.terminal.assertion+"]"),e}toString(){var t="epubcfi(";return t+=this.segmentString(this.base),t+="!",t+=this.segmentString(this.path),this.range&&this.start&&(t+=",",t+=this.segmentString(this.start)),this.range&&this.end&&(t+=",",t+=this.segmentString(this.end)),t+=")"}compare(t,e){var i,n,r,o;if("string"==typeof t&&(t=new s(t)),"string"==typeof e&&(e=new s(e)),t.spinePos>e.spinePos)return 1;if(t.spinePos<e.spinePos)return-1;t.range?(i=t.path.steps.concat(t.start.steps),r=t.start.terminal):(i=t.path.steps,r=t.path.terminal),e.range?(n=e.path.steps.concat(e.start.steps),o=e.start.terminal):(n=e.path.steps,o=e.path.terminal);for(var a=0;a<i.length;a++){if(!i[a])return-1;if(!n[a])return 1;if(i[a].index>n[a].index)return 1;if(i[a].index<n[a].index)return-1}return i.length<n.length?-1:r.offset>o.offset?1:r.offset<o.offset?-1:0}step(t){var e=3===t.nodeType?"text":"element";return{id:t.id,tagName:t.tagName,type:e,index:this.position(t)}}filteredStep(t,e){var i,n=this.filter(t,e);if(n)return i=3===n.nodeType?"text":"element",{id:n.id,tagName:n.tagName,type:i,index:this.filteredPosition(n,e)}}pathTo(t,e,i){for(var n,s={steps:[],terminal:{offset:null,assertion:null}},r=t;r&&r.parentNode&&9!=r.parentNode.nodeType;)(n=i?this.filteredStep(r,i):this.step(r))&&s.steps.unshift(n),r=r.parentNode;return null!=e&&e>=0&&(s.terminal.offset=e,"text"!=s.steps[s.steps.length-1].type&&s.steps.push({type:"text",index:0})),s}equalStep(t,e){return!(!t||!e)&&(t.index===e.index&&t.id===e.id&&t.type===e.type)}fromRange(t,e,i){var n={range:!1,base:{},path:{},start:null,end:null},s=t.startContainer,r=t.endContainer,o=t.startOffset,a=t.endOffset,h=!1;if(i&&(h=null!=s.ownerDocument.querySelector("."+i)),"string"==typeof e?(n.base=this.parseComponent(e),n.spinePos=n.base.steps[1].index):"object"==typeof e&&(n.base=e),t.collapsed)h&&(o=this.patchOffset(s,o,i)),n.path=this.pathTo(s,o,i);else{n.range=!0,h&&(o=this.patchOffset(s,o,i)),n.start=this.pathTo(s,o,i),h&&(a=this.patchOffset(r,a,i)),n.end=this.pathTo(r,a,i),n.path={steps:[],terminal:null};var l,c=n.start.steps.length;for(l=0;l<c&&this.equalStep(n.start.steps[l],n.end.steps[l]);l++)l===c-1?n.start.terminal===n.end.terminal&&(n.path.steps.push(n.start.steps[l]),n.range=!1):n.path.steps.push(n.start.steps[l]);n.start.steps=n.start.steps.slice(n.path.steps.length),n.end.steps=n.end.steps.slice(n.path.steps.length)}return n}fromNode(t,e,i){var n={range:!1,base:{},path:{},start:null,end:null};return"string"==typeof e?(n.base=this.parseComponent(e),n.spinePos=n.base.steps[1].index):"object"==typeof e&&(n.base=e),n.path=this.pathTo(t,null,i),n}filter(t,e){var i,n,s,r,o,a=!1;return 3===t.nodeType?(a=!0,s=t.parentNode,i=t.parentNode.classList.contains(e)):(a=!1,i=t.classList.contains(e)),i&&a?(r=s.previousSibling,o=s.nextSibling,r&&3===r.nodeType?n=r:o&&3===o.nodeType&&(n=o),n||t):!(i&&!a)&&t}patchOffset(t,e,i){if(3!=t.nodeType)throw new Error("Anchor must be a text node");var n=t,s=e;for(t.parentNode.classList.contains(i)&&(n=t.parentNode);n.previousSibling;){if(1===n.previousSibling.nodeType){if(!n.previousSibling.classList.contains(i))break;s+=n.previousSibling.textContent.length}else s+=n.previousSibling.textContent.length;n=n.previousSibling}return s}normalizedMap(t,e,i){var n,s,r,o={},a=-1,h=t.length;for(n=0;n<h;n++)1===(s=t[n].nodeType)&&t[n].classList.contains(i)&&(s=3),n>0&&3===s&&3===r?o[n]=a:e===s&&(a+=1,o[n]=a),r=s;return o}position(t){var e,i;return 1===t.nodeType?((e=t.parentNode.children)||(e=Object(n.findChildren)(t.parentNode)),i=Array.prototype.indexOf.call(e,t)):i=(e=this.textNodes(t.parentNode)).indexOf(t),i}filteredPosition(t,e){var i,n;return 1===t.nodeType?(i=t.parentNode.children,n=this.normalizedMap(i,1,e)):(i=t.parentNode.childNodes,t.parentNode.classList.contains(e)&&(i=(t=t.parentNode).parentNode.childNodes),n=this.normalizedMap(i,3,e)),n[Array.prototype.indexOf.call(i,t)]}stepsToXpath(t){var e=[".","*"];return t.forEach((function(t){var i=t.index+1;t.id?e.push("*[position()="+i+" and @id='"+t.id+"']"):"text"===t.type?e.push("text()["+i+"]"):e.push("*["+i+"]")})),e.join("/")}stepsToQuerySelector(t){var e=["html"];return t.forEach((function(t){var i=t.index+1;t.id?e.push("#"+t.id):"text"===t.type||e.push("*:nth-child("+i+")")})),e.join(">")}textNodes(t,e){return Array.prototype.slice.call(t.childNodes).filter((function(t){return 3===t.nodeType||!(!e||!t.classList.contains(e))}))}walkToNode(t,e,i){var s,r,o=e||document,a=o.documentElement,h=t.length;for(r=0;r<h&&("element"===(s=t[r]).type?a=s.id?o.getElementById(s.id):(a.children||Object(n.findChildren)(a))[s.index]:"text"===s.type&&(a=this.textNodes(a,i)[s.index]),a);r++);return a}findNode(t,e,i){var n,s,r=e||document;return i||void 0===r.evaluate?n=i?this.walkToNode(t,r,i):this.walkToNode(t,r):(s=this.stepsToXpath(t),n=r.evaluate(s,r,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue),n}fixMiss(t,e,i,n){var s,r,o=this.findNode(t.slice(0,-1),i,n),a=o.childNodes,h=this.normalizedMap(a,3,n),l=t[t.length-1].index;for(let t in h){if(!h.hasOwnProperty(t))return;if(h[t]===l){if(!(e>(r=(s=a[t]).textContent.length))){o=1===s.nodeType?s.childNodes[0]:s;break}e-=r}}return{container:o,offset:e}}toRange(t,e){var i,s,r,o,a,h,l,c,u=t||document,d=!!e&&null!=u.querySelector("."+e);if(i=void 0!==u.createRange?u.createRange():new n.RangeObject,this.range?(s=this.start,h=this.path.steps.concat(s.steps),o=this.findNode(h,u,d?e:null),r=this.end,l=this.path.steps.concat(r.steps),a=this.findNode(l,u,d?e:null)):(s=this.path,h=this.path.steps,o=this.findNode(this.path.steps,u,d?e:null)),!o)return console.log("No startContainer found for",this.toString()),null;try{null!=s.terminal.offset?i.setStart(o,s.terminal.offset):i.setStart(o,0)}catch(t){c=this.fixMiss(h,s.terminal.offset,u,d?e:null),i.setStart(c.container,c.offset)}if(a)try{null!=r.terminal.offset?i.setEnd(a,r.terminal.offset):i.setEnd(a,0)}catch(t){c=this.fixMiss(l,this.end.terminal.offset,u,d?e:null),i.setEnd(c.container,c.offset)}return i}isCfiString(t){return"string"==typeof t&&0===t.indexOf("epubcfi(")&&")"===t[t.length-1]}generateChapterComponent(t,e,i){var n="/"+2*(t+1)+"/";return n+=2*(parseInt(e)+1),i&&(n+="["+i+"]"),n}collapse(t){this.range&&(this.range=!1,t?(this.path.steps=this.path.steps.concat(this.start.steps),this.path.terminal=this.start.terminal):(this.path.steps=this.path.steps.concat(this.end.steps),this.path.terminal=this.end.terminal))}}e.a=s},function(t,e,i){"use strict";var n,s,r,o,a,h,l,c=i(31),u=i(45),d=Function.prototype.apply,f=Function.prototype.call,p=Object.create,g=Object.defineProperty,m=Object.defineProperties,v=Object.prototype.hasOwnProperty,y={configurable:!0,enumerable:!1,writable:!0};s=function(t,e){var i,s;return u(e),s=this,n.call(this,t,i=function(){r.call(s,t,i),d.call(e,this,arguments)}),i.__eeOnceListener__=e,this},a={on:n=function(t,e){var i;return u(e),v.call(this,"__ee__")?i=this.__ee__:(i=y.value=p(null),g(this,"__ee__",y),y.value=null),i[t]?"object"==typeof i[t]?i[t].push(e):i[t]=[i[t],e]:i[t]=e,this},once:s,off:r=function(t,e){var i,n,s,r;if(u(e),!v.call(this,"__ee__"))return this;if(!(i=this.__ee__)[t])return this;if("object"==typeof(n=i[t]))for(r=0;s=n[r];++r)s!==e&&s.__eeOnceListener__!==e||(2===n.length?i[t]=n[r?0:1]:n.splice(r,1));else n!==e&&n.__eeOnceListener__!==e||delete i[t];return this},emit:o=function(t){var e,i,n,s,r;if(v.call(this,"__ee__")&&(s=this.__ee__[t]))if("object"==typeof s){for(i=arguments.length,r=new Array(i-1),e=1;e<i;++e)r[e-1]=arguments[e];for(s=s.slice(),e=0;n=s[e];++e)d.call(n,this,r)}else switch(arguments.length){case 1:f.call(s,this);break;case 2:f.call(s,this,arguments[1]);break;case 3:f.call(s,this,arguments[1],arguments[2]);break;default:for(i=arguments.length,r=new Array(i-1),e=1;e<i;++e)r[e-1]=arguments[e];d.call(s,this,r)}}},h={on:c(n),once:c(s),off:c(r),emit:c(o)},l=m({},h),t.exports=e=function(t){return null==t?p(l):m(Object(t),h)},e.methods=a},function(t,e,i){"use strict";var n=i(7),s=i.n(n);e.a=class{constructor(t){var e;t.indexOf("://")>-1&&(t=new URL(t).pathname),e=this.parse(t),this.path=t,this.isDirectory(t)?this.directory=t:this.directory=e.dir+"/",this.filename=e.base,this.extension=e.ext.slice(1)}parse(t){return s.a.parse(t)}isAbsolute(t){return s.a.isAbsolute(t||this.path)}isDirectory(t){return"/"===t.charAt(t.length-1)}resolve(t){return s.a.resolve(this.directory,t)}relative(t){return t&&t.indexOf("://")>-1?t:s.a.relative(this.directory,t)}splitPath(t){return this.splitPathRe.exec(t).slice(1)}toString(){return this.path}}},function(t,e,i){"use strict";var n=i(4),s=i(7),r=i.n(s);e.a=class{constructor(t,e){var i=t.indexOf("://")>-1,s=t;if(this.Url=void 0,this.href=t,this.protocol="",this.origin="",this.hash="",this.hash="",this.search="",this.base=e,!i&&!1!==e&&"string"!=typeof e&&window&&window.location&&(this.base=window.location.href),i||this.base)try{this.base?this.Url=new URL(t,this.base):this.Url=new URL(t),this.href=this.Url.href,this.protocol=this.Url.protocol,this.origin=this.Url.origin,this.hash=this.Url.hash,this.search=this.Url.search,s=this.Url.pathname+(this.Url.search?this.Url.search:"")}catch(t){this.Url=void 0,this.base&&(s=new n.a(this.base).resolve(s))}this.Path=new n.a(s),this.directory=this.Path.directory,this.filename=this.Path.filename,this.extension=this.Path.extension}path(){return this.Path}resolve(t){var e;return t.indexOf("://")>-1?t:(e=r.a.resolve(this.directory,t),this.origin+e)}relative(t){return r.a.relative(t,this.directory)}toString(){return this.href}}},function(t,e,i){"use strict";e.a=class{constructor(t){this.context=t||this,this.hooks=[]}register(){for(var t=0;t<arguments.length;++t)if("function"==typeof arguments[t])this.hooks.push(arguments[t]);else for(var e=0;e<arguments[t].length;++e)this.hooks.push(arguments[t][e])}deregister(t){let e;for(let i=0;i<this.hooks.length;i++)if(e=this.hooks[i],e===t){this.hooks.splice(i,1);break}}trigger(){var t=arguments,e=this.context,i=[];return this.hooks.forEach((function(n){try{var s=n.apply(e,t)}catch(t){console.log(t)}s&&"function"==typeof s.then&&i.push(s)})),Promise.all(i)}list(){return this.hooks}clear(){return this.hooks=[]}}},function(t,e,i){"use strict";if(!n)var n={cwd:function(){return"/"}};function s(t){if("string"!=typeof t)throw new TypeError("Path must be a string. Received "+t)}function r(t,e){for(var i,n="",s=-1,r=0,o=0;o<=t.length;++o){if(o<t.length)i=t.charCodeAt(o);else{if(47===i)break;i=47}if(47===i){if(s===o-1||1===r);else if(s!==o-1&&2===r){if(n.length<2||46!==n.charCodeAt(n.length-1)||46!==n.charCodeAt(n.length-2))if(n.length>2){for(var a=n.length-1,h=a;h>=0&&47!==n.charCodeAt(h);--h);if(h!==a){n=-1===h?"":n.slice(0,h),s=o,r=0;continue}}else if(2===n.length||1===n.length){n="",s=o,r=0;continue}e&&(n.length>0?n+="/..":n="..")}else n.length>0?n+="/"+t.slice(s+1,o):n=t.slice(s+1,o);s=o,r=0}else 46===i&&-1!==r?++r:r=-1}return n}var o={resolve:function(){for(var t,e="",i=!1,o=arguments.length-1;o>=-1&&!i;o--){var a;o>=0?a=arguments[o]:(void 0===t&&(t=n.cwd()),a=t),s(a),0!==a.length&&(e=a+"/"+e,i=47===a.charCodeAt(0))}return e=r(e,!i),i?e.length>0?"/"+e:"/":e.length>0?e:"."},normalize:function(t){if(s(t),0===t.length)return".";var e=47===t.charCodeAt(0),i=47===t.charCodeAt(t.length-1);return 0!==(t=r(t,!e)).length||e||(t="."),t.length>0&&i&&(t+="/"),e?"/"+t:t},isAbsolute:function(t){return s(t),t.length>0&&47===t.charCodeAt(0)},join:function(){if(0===arguments.length)return".";for(var t,e=0;e<arguments.length;++e){var i=arguments[e];s(i),i.length>0&&(void 0===t?t=i:t+="/"+i)}return void 0===t?".":o.normalize(t)},relative:function(t,e){if(s(t),s(e),t===e)return"";if((t=o.resolve(t))===(e=o.resolve(e)))return"";for(var i=1;i<t.length&&47===t.charCodeAt(i);++i);for(var n=t.length,r=n-i,a=1;a<e.length&&47===e.charCodeAt(a);++a);for(var h=e.length-a,l=r<h?r:h,c=-1,u=0;u<=l;++u){if(u===l){if(h>l){if(47===e.charCodeAt(a+u))return e.slice(a+u+1);if(0===u)return e.slice(a+u)}else r>l&&(47===t.charCodeAt(i+u)?c=u:0===u&&(c=0));break}var d=t.charCodeAt(i+u);if(d!==e.charCodeAt(a+u))break;47===d&&(c=u)}var f="";for(u=i+c+1;u<=n;++u)u!==n&&47!==t.charCodeAt(u)||(0===f.length?f+="..":f+="/..");return f.length>0?f+e.slice(a+c):(a+=c,47===e.charCodeAt(a)&&++a,e.slice(a))},_makeLong:function(t){return t},dirname:function(t){if(s(t),0===t.length)return".";for(var e=t.charCodeAt(0),i=47===e,n=-1,r=!0,o=t.length-1;o>=1;--o)if(47===(e=t.charCodeAt(o))){if(!r){n=o;break}}else r=!1;return-1===n?i?"/":".":i&&1===n?"//":t.slice(0,n)},basename:function(t,e){if(void 0!==e&&"string"!=typeof e)throw new TypeError('"ext" argument must be a string');s(t);var i,n=0,r=-1,o=!0;if(void 0!==e&&e.length>0&&e.length<=t.length){if(e.length===t.length&&e===t)return"";var a=e.length-1,h=-1;for(i=t.length-1;i>=0;--i){var l=t.charCodeAt(i);if(47===l){if(!o){n=i+1;break}}else-1===h&&(o=!1,h=i+1),a>=0&&(l===e.charCodeAt(a)?-1==--a&&(r=i):(a=-1,r=h))}return n===r?r=h:-1===r&&(r=t.length),t.slice(n,r)}for(i=t.length-1;i>=0;--i)if(47===t.charCodeAt(i)){if(!o){n=i+1;break}}else-1===r&&(o=!1,r=i+1);return-1===r?"":t.slice(n,r)},extname:function(t){s(t);for(var e=-1,i=0,n=-1,r=!0,o=0,a=t.length-1;a>=0;--a){var h=t.charCodeAt(a);if(47!==h)-1===n&&(r=!1,n=a+1),46===h?-1===e?e=a:1!==o&&(o=1):-1!==e&&(o=-1);else if(!r){i=a+1;break}}return-1===e||-1===n||0===o||1===o&&e===n-1&&e===i+1?"":t.slice(e,n)},format:function(t){if(null===t||"object"!=typeof t)throw new TypeError('Parameter "pathObject" must be an object, not '+typeof t);return function(t,e){var i=e.dir||e.root,n=e.base||(e.name||"")+(e.ext||"");return i?i===e.root?i+n:i+t+n:n}("/",t)},parse:function(t){s(t);var e={root:"",dir:"",base:"",ext:"",name:""};if(0===t.length)return e;var i,n=t.charCodeAt(0),r=47===n;r?(e.root="/",i=1):i=0;for(var o=-1,a=0,h=-1,l=!0,c=t.length-1,u=0;c>=i;--c)if(47!==(n=t.charCodeAt(c)))-1===h&&(l=!1,h=c+1),46===n?-1===o?o=c:1!==u&&(u=1):-1!==o&&(u=-1);else if(!l){a=c+1;break}return-1===o||-1===h||0===u||1===u&&o===h-1&&o===a+1?-1!==h&&(e.base=e.name=0===a&&r?t.slice(1,h):t.slice(a,h)):(0===a&&r?(e.name=t.slice(1,o),e.base=t.slice(1,h)):(e.name=t.slice(a,o),e.base=t.slice(a,h)),e.ext=t.slice(o,h)),a>0?e.dir=t.slice(0,a-1):r&&(e.dir="/"),e},sep:"/",delimiter:":",posix:null};t.exports=o},function(t,e,i){"use strict";i.d(e,"a",(function(){return r})),i.d(e,"b",(function(){return o})),i.d(e,"d",(function(){return a})),i.d(e,"c",(function(){return h})),i.d(e,"e",(function(){return l}));var n=i(0),s=i(5);i(4);function r(t,e){var i,s,r=e.url,o=r.indexOf("://")>-1;t&&(s=Object(n.qs)(t,"head"),(i=Object(n.qs)(s,"base"))||(i=t.createElement("base"),s.insertBefore(i,s.firstChild)),!o&&window&&window.location&&(r=window.location.origin+r),i.setAttribute("href",r))}function o(t,e){var i,s,r=e.canonical;t&&(i=Object(n.qs)(t,"head"),(s=Object(n.qs)(i,"link[rel='canonical']"))?s.setAttribute("href",r):((s=t.createElement("link")).setAttribute("rel","canonical"),s.setAttribute("href",r),i.appendChild(s)))}function a(t,e){var i,s,r=e.idref;t&&(i=Object(n.qs)(t,"head"),(s=Object(n.qs)(i,"link[property='dc.identifier']"))?s.setAttribute("content",r):((s=t.createElement("meta")).setAttribute("name","dc.identifier"),s.setAttribute("content",r),i.appendChild(s)))}function h(t,e){var i=t.querySelectorAll("a[href]");if(i.length)for(var r=Object(n.qs)(t.ownerDocument,"base"),o=r?r.getAttribute("href"):void 0,a=function(t){var i=t.getAttribute("href");if(0!==i.indexOf("mailto:"))if(i.indexOf("://")>-1)t.setAttribute("target","_blank");else{var n;try{n=new s.a(i,o)}catch(t){}t.onclick=function(){return n&&n.hash?e(n.Path.path+n.hash):e(n?n.Path.path:i),!1}}}.bind(this),h=0;h<i.length;h++)a(i[h])}function l(t,e,i){return e.forEach((function(e,n){e&&i[n]&&(e=e.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g,"\\\\$&"),t=t.replace(new RegExp(e,"g"),i[n]))})),t}},function(t,e,i){"use strict";var n=i(0);e.a=class{constructor(t){this._q=[],this.context=t,this.tick=n.requestAnimationFrame,this.running=!1,this.paused=!1}enqueue(){var t,e,i=[].shift.call(arguments),s=arguments;if(!i)throw new Error("No Task Provided");return e="function"==typeof i?{task:i,args:s,deferred:t=new n.defer,promise:t.promise}:{promise:i},this._q.push(e),0!=this.paused||this.running||this.run(),e.promise}dequeue(){var t,e,i;return!this._q.length||this.paused?((t=new n.defer).deferred.resolve(),t.promise):(e=(t=this._q.shift()).task)?(i=e.apply(this.context,t.args))&&"function"==typeof i.then?i.then(function(){t.deferred.resolve.apply(this.context,arguments)}.bind(this),function(){t.deferred.reject.apply(this.context,arguments)}.bind(this)):(t.deferred.resolve.apply(this.context,i),t.promise):t.promise?t.promise:void 0}dump(){for(;this._q.length;)this.dequeue()}run(){return this.running||(this.running=!0,this.defered=new n.defer),this.tick.call(window,()=>{this._q.length?this.dequeue().then(function(){this.run()}.bind(this)):(this.defered.resolve(),this.running=void 0)}),1==this.paused&&(this.paused=!1),this.defered.promise}flush(){return this.running?this.running:this._q.length?(this.running=this.dequeue().then(function(){return this.running=void 0,this.flush()}.bind(this)),this.running):void 0}clear(){this._q=[]}length(){return this._q.length}pause(){this.paused=!0}stop(){this._q=[],this.running=!1,this.paused=!0}}},function(t,e,i){"use strict";var n=i(3),s=i.n(n),r=i(0);function o(){var t="reverse",e=function(){var t=document.createElement("div");t.dir="rtl",t.style.position="fixed",t.style.width="1px",t.style.height="1px",t.style.top="0px",t.style.left="0px",t.style.overflow="hidden";var e=document.createElement("div");e.style.width="2px";var i=document.createElement("span");i.style.width="1px",i.style.display="inline-block";var n=document.createElement("span");return n.style.width="1px",n.style.display="inline-block",e.appendChild(i),e.appendChild(n),t.appendChild(e),t}();return document.body.appendChild(e),e.scrollLeft>0?t="default":"undefined"!=typeof Element&&Element.prototype.scrollIntoView?(e.children[0].children[1].scrollIntoView(),e.scrollLeft<0&&(t="negative")):(e.scrollLeft=1,0===e.scrollLeft&&(t="negative")),document.body.removeChild(e),t}var a=i(11),h=i(9),l=i(28),c=i.n(l);var u=class{constructor(t){this.settings=t||{},this.id="epubjs-container-"+Object(r.uuid)(),this.container=this.create(this.settings),this.settings.hidden&&(this.wrapper=this.wrap(this.container))}create(t){let e=t.height,i=t.width,n=t.overflow||!1,s=t.axis||"vertical",o=t.direction;Object(r.extend)(this.settings,t),t.height&&Object(r.isNumber)(t.height)&&(e=t.height+"px"),t.width&&Object(r.isNumber)(t.width)&&(i=t.width+"px");let a=document.createElement("div");return a.id=this.id,a.classList.add("epub-container"),a.style.wordSpacing="0",a.style.lineHeight="0",a.style.verticalAlign="top",a.style.position="relative","horizontal"===s&&(a.style.display="flex",a.style.flexDirection="row",a.style.flexWrap="nowrap"),i&&(a.style.width=i),e&&(a.style.height=e),n&&("scroll"===n&&"vertical"===s?(a.style["overflow-y"]=n,a.style["overflow-x"]="hidden"):"scroll"===n&&"horizontal"===s?(a.style["overflow-y"]="hidden",a.style["overflow-x"]=n):a.style.overflow=n),o&&(a.dir=o,a.style.direction=o),o&&this.settings.fullsize&&(document.body.style.direction=o),a}wrap(t){var e=document.createElement("div");return e.style.visibility="hidden",e.style.overflow="hidden",e.style.width="0",e.style.height="0",e.appendChild(t),e}getElement(t){var e;if(Object(r.isElement)(t)?e=t:"string"==typeof t&&(e=document.getElementById(t)),!e)throw new Error("Not an Element");return e}attachTo(t){var e,i=this.getElement(t);if(i)return e=this.settings.hidden?this.wrapper:this.container,i.appendChild(e),this.element=i,i}getContainer(){return this.container}onResize(t){Object(r.isNumber)(this.settings.width)&&Object(r.isNumber)(this.settings.height)||(this.resizeFunc=c()(t,50),window.addEventListener("resize",this.resizeFunc,!1))}onOrientationChange(t){this.orientationChangeFunc=t,window.addEventListener("orientationchange",this.orientationChangeFunc,!1)}size(t,e){var i;let n=t||this.settings.width,s=e||this.settings.height;null===t?(i=this.element.getBoundingClientRect()).width&&(t=Math.floor(i.width),this.container.style.width=t+"px"):Object(r.isNumber)(t)?this.container.style.width=t+"px":this.container.style.width=t,null===e?(i=i||this.element.getBoundingClientRect()).height&&(e=i.height,this.container.style.height=e+"px"):Object(r.isNumber)(e)?this.container.style.height=e+"px":this.container.style.height=e,Object(r.isNumber)(t)||(t=this.container.clientWidth),Object(r.isNumber)(e)||(e=this.container.clientHeight),this.containerStyles=window.getComputedStyle(this.container),this.containerPadding={left:parseFloat(this.containerStyles["padding-left"])||0,right:parseFloat(this.containerStyles["padding-right"])||0,top:parseFloat(this.containerStyles["padding-top"])||0,bottom:parseFloat(this.containerStyles["padding-bottom"])||0};let o=Object(r.windowBounds)(),a=window.getComputedStyle(document.body),h=parseFloat(a["padding-left"])||0,l=parseFloat(a["padding-right"])||0,c=parseFloat(a["padding-top"])||0,u=parseFloat(a["padding-bottom"])||0;return n||(t=o.width-h-l),(this.settings.fullsize&&!s||!s)&&(e=o.height-c-u),{width:t-this.containerPadding.left-this.containerPadding.right,height:e-this.containerPadding.top-this.containerPadding.bottom}}bounds(){let t;return"visible"!==this.container.style.overflow&&(t=this.container&&this.container.getBoundingClientRect()),t&&t.width&&t.height?t:Object(r.windowBounds)()}getSheet(){var t=document.createElement("style");return t.appendChild(document.createTextNode("")),document.head.appendChild(t),t.sheet}addStyleRules(t,e){var i="#"+this.id+" ",n="";this.sheet||(this.sheet=this.getSheet()),e.forEach((function(t){for(var e in t)t.hasOwnProperty(e)&&(n+=e+":"+t[e]+";")})),this.sheet.insertRule(i+t+" {"+n+"}",0)}axis(t){"horizontal"===t?(this.container.style.display="flex",this.container.style.flexDirection="row",this.container.style.flexWrap="nowrap"):this.container.style.display="block",this.settings.axis=t}direction(t){this.container&&(this.container.dir=t,this.container.style.direction=t),this.settings.fullsize&&(document.body.style.direction=t),this.settings.dir=t}overflow(t){this.container&&("scroll"===t&&"vertical"===this.settings.axis?(this.container.style["overflow-y"]=t,this.container.style["overflow-x"]="hidden"):"scroll"===t&&"horizontal"===this.settings.axis?(this.container.style["overflow-y"]="hidden",this.container.style["overflow-x"]=t):this.container.style.overflow=t),this.settings.overflow=t}destroy(){this.element&&(this.settings.hidden?this.wrapper:this.container,this.element.contains(this.container)&&this.element.removeChild(this.container),window.removeEventListener("resize",this.resizeFunc),window.removeEventListener("orientationChange",this.orientationChangeFunc))}};var d=class{constructor(t){this.container=t,this._views=[],this.length=0,this.hidden=!1}all(){return this._views}first(){return this._views[0]}last(){return this._views[this._views.length-1]}indexOf(t){return this._views.indexOf(t)}slice(){return this._views.slice.apply(this._views,arguments)}get(t){return this._views[t]}append(t){return this._views.push(t),this.container&&this.container.appendChild(t.element),this.length++,t}prepend(t){return this._views.unshift(t),this.container&&this.container.insertBefore(t.element,this.container.firstChild),this.length++,t}insert(t,e){return this._views.splice(e,0,t),this.container&&(e<this.container.children.length?this.container.insertBefore(t.element,this.container.children[e]):this.container.appendChild(t.element)),this.length++,t}remove(t){var e=this._views.indexOf(t);e>-1&&this._views.splice(e,1),this.destroy(t),this.length--}destroy(t){t.displayed&&t.destroy(),this.container&&this.container.removeChild(t.element),t=null}forEach(){return this._views.forEach.apply(this._views,arguments)}clear(){var t,e=this.length;if(this.length){for(var i=0;i<e;i++)t=this._views[i],this.destroy(t);this._views=[],this.length=0}}find(t){for(var e,i=this.length,n=0;n<i;n++)if((e=this._views[n]).displayed&&e.section.index==t.index)return e}displayed(){for(var t,e=[],i=this.length,n=0;n<i;n++)(t=this._views[n]).displayed&&e.push(t);return e}show(){for(var t,e=this.length,i=0;i<e;i++)(t=this._views[i]).displayed&&t.show();this.hidden=!1}hide(){for(var t,e=this.length,i=0;i<e;i++)(t=this._views[i]).displayed&&t.hide();this.hidden=!0}},f=i(1);class p{constructor(t){this.name="default",this.optsSettings=t.settings,this.View=t.view,this.request=t.request,this.renditionQueue=t.queue,this.q=new h.a(this),this.settings=Object(r.extend)(this.settings||{},{infinite:!0,hidden:!1,width:void 0,height:void 0,axis:void 0,writingMode:void 0,flow:"scrolled",ignoreClass:"",fullsize:void 0,allowScriptedContent:!1,allowPopups:!1}),Object(r.extend)(this.settings,t.settings||{}),this.viewSettings={ignoreClass:this.settings.ignoreClass,axis:this.settings.axis,flow:this.settings.flow,layout:this.layout,method:this.settings.method,width:0,height:0,forceEvenPages:!0,allowScriptedContent:this.settings.allowScriptedContent,allowPopups:this.settings.allowPopups},this.rendered=!1}render(t,e){let i=t.tagName;void 0!==this.settings.fullsize||!i||"body"!=i.toLowerCase()&&"html"!=i.toLowerCase()||(this.settings.fullsize=!0),this.settings.fullsize&&(this.settings.overflow="visible",this.overflow=this.settings.overflow),this.settings.size=e,this.settings.rtlScrollType=o(),this.stage=new u({width:e.width,height:e.height,overflow:this.overflow,hidden:this.settings.hidden,axis:this.settings.axis,fullsize:this.settings.fullsize,direction:this.settings.direction}),this.stage.attachTo(t),this.container=this.stage.getContainer(),this.views=new d(this.container),this._bounds=this.bounds(),this._stageSize=this.stage.size(),this.viewSettings.width=this._stageSize.width,this.viewSettings.height=this._stageSize.height,this.stage.onResize(this.onResized.bind(this)),this.stage.onOrientationChange(this.onOrientationChange.bind(this)),this.addEventListeners(),this.layout&&this.updateLayout(),this.rendered=!0}addEventListeners(){var t;window.addEventListener("unload",function(t){this.destroy()}.bind(this)),t=this.settings.fullsize?window:this.container,this._onScroll=this.onScroll.bind(this),t.addEventListener("scroll",this._onScroll)}removeEventListeners(){(this.settings.fullsize?window:this.container).removeEventListener("scroll",this._onScroll),this._onScroll=void 0}destroy(){clearTimeout(this.orientationTimeout),clearTimeout(this.resizeTimeout),clearTimeout(this.afterScrolled),this.clear(),this.removeEventListeners(),this.stage.destroy(),this.rendered=!1}onOrientationChange(t){let{orientation:e}=window;this.optsSettings.resizeOnOrientationChange&&this.resize(),clearTimeout(this.orientationTimeout),this.orientationTimeout=setTimeout(function(){this.orientationTimeout=void 0,this.optsSettings.resizeOnOrientationChange&&this.resize(),this.emit(f.c.MANAGERS.ORIENTATION_CHANGE,e)}.bind(this),500)}onResized(t){this.resize()}resize(t,e,i){let n=this.stage.size(t,e);this.winBounds=Object(r.windowBounds)(),this.orientationTimeout&&this.winBounds.width===this.winBounds.height?this._stageSize=void 0:this._stageSize&&this._stageSize.width===n.width&&this._stageSize.height===n.height||(this._stageSize=n,this._bounds=this.bounds(),this.clear(),this.viewSettings.width=this._stageSize.width,this.viewSettings.height=this._stageSize.height,this.updateLayout(),this.emit(f.c.MANAGERS.RESIZED,{width:this._stageSize.width,height:this._stageSize.height},i))}createView(t,e){return new this.View(t,Object(r.extend)(this.viewSettings,{forceRight:e}))}handleNextPrePaginated(t,e,i){let n;if("pre-paginated"===this.layout.name&&this.layout.divisor>1){if(t||0===e.index)return;if(n=e.next(),n&&!n.properties.includes("page-spread-left"))return i.call(this,n)}}display(t,e){var i=new r.defer,n=i.promise;(e===t.href||Object(r.isNumber)(e))&&(e=void 0);var s=this.views.find(t);if(s&&t&&"pre-paginated"!==this.layout.name){let t=s.offset();if("ltr"===this.settings.direction)this.scrollTo(t.left,t.top,!0);else{let e=s.width();this.scrollTo(t.left+e,t.top,!0)}if(e){let t=s.locationOf(e),i=s.width();this.moveTo(t,i)}return i.resolve(),n}this.clear();let o=!1;return"pre-paginated"===this.layout.name&&2===this.layout.divisor&&t.properties.includes("page-spread-right")&&(o=!0),this.add(t,o).then(function(t){if(e){let i=t.locationOf(e),n=t.width();this.moveTo(i,n)}}.bind(this),t=>{i.reject(t)}).then(function(){return this.handleNextPrePaginated(o,t,this.add)}.bind(this)).then(function(){this.views.show(),i.resolve()}.bind(this)),n}afterDisplayed(t){this.emit(f.c.MANAGERS.ADDED,t)}afterResized(t){this.emit(f.c.MANAGERS.RESIZE,t.section)}moveTo(t,e){var i=0,n=0;this.isPaginated?((i=Math.floor(t.left/this.layout.delta)*this.layout.delta)+this.layout.delta>this.container.scrollWidth&&(i=this.container.scrollWidth-this.layout.delta),(n=Math.floor(t.top/this.layout.delta)*this.layout.delta)+this.layout.delta>this.container.scrollHeight&&(n=this.container.scrollHeight-this.layout.delta)):n=t.top,"rtl"===this.settings.direction&&(i+=this.layout.delta,i-=e),this.scrollTo(i,n,!0)}add(t,e){var i=this.createView(t,e);return this.views.append(i),i.onDisplayed=this.afterDisplayed.bind(this),i.onResize=this.afterResized.bind(this),i.on(f.c.VIEWS.AXIS,t=>{this.updateAxis(t)}),i.on(f.c.VIEWS.WRITING_MODE,t=>{this.updateWritingMode(t)}),i.display(this.request)}append(t,e){var i=this.createView(t,e);return this.views.append(i),i.onDisplayed=this.afterDisplayed.bind(this),i.onResize=this.afterResized.bind(this),i.on(f.c.VIEWS.AXIS,t=>{this.updateAxis(t)}),i.on(f.c.VIEWS.WRITING_MODE,t=>{this.updateWritingMode(t)}),i.display(this.request)}prepend(t,e){var i=this.createView(t,e);return i.on(f.c.VIEWS.RESIZED,t=>{this.counter(t)}),this.views.prepend(i),i.onDisplayed=this.afterDisplayed.bind(this),i.onResize=this.afterResized.bind(this),i.on(f.c.VIEWS.AXIS,t=>{this.updateAxis(t)}),i.on(f.c.VIEWS.WRITING_MODE,t=>{this.updateWritingMode(t)}),i.display(this.request)}counter(t){"vertical"===this.settings.axis?this.scrollBy(0,t.heightDelta,!0):this.scrollBy(t.widthDelta,0,!0)}next(){var t;let e=this.settings.direction;if(this.views.length){if(!this.isPaginated||"horizontal"!==this.settings.axis||e&&"ltr"!==e)if(this.isPaginated&&"horizontal"===this.settings.axis&&"rtl"===e)this.scrollLeft=this.container.scrollLeft,"default"===this.settings.rtlScrollType?this.container.scrollLeft>0?this.scrollBy(this.layout.delta,0,!0):t=this.views.last().section.next():this.container.scrollLeft+-1*this.layout.delta>-1*this.container.scrollWidth?this.scrollBy(this.layout.delta,0,!0):t=this.views.last().section.next();else if(this.isPaginated&&"vertical"===this.settings.axis){this.scrollTop=this.container.scrollTop,this.container.scrollTop+this.container.offsetHeight<this.container.scrollHeight?this.scrollBy(0,this.layout.height,!0):t=this.views.last().section.next()}else t=this.views.last().section.next();else this.scrollLeft=this.container.scrollLeft,this.container.scrollLeft+this.container.offsetWidth+this.layout.delta<=this.container.scrollWidth?this.scrollBy(this.layout.delta,0,!0):t=this.views.last().section.next();if(t){this.clear(),this.updateLayout();let e=!1;return"pre-paginated"===this.layout.name&&2===this.layout.divisor&&t.properties.includes("page-spread-right")&&(e=!0),this.append(t,e).then(function(){return this.handleNextPrePaginated(e,t,this.append)}.bind(this),t=>t).then(function(){this.isPaginated||"horizontal"!==this.settings.axis||"rtl"!==this.settings.direction||"default"!==this.settings.rtlScrollType||this.scrollTo(this.container.scrollWidth,0,!0),this.views.show()}.bind(this))}}}prev(){var t;let e=this.settings.direction;if(this.views.length){if(!this.isPaginated||"horizontal"!==this.settings.axis||e&&"ltr"!==e)if(this.isPaginated&&"horizontal"===this.settings.axis&&"rtl"===e)this.scrollLeft=this.container.scrollLeft,"default"===this.settings.rtlScrollType?this.container.scrollLeft+this.container.offsetWidth<this.container.scrollWidth?this.scrollBy(-this.layout.delta,0,!0):t=this.views.first().section.prev():this.container.scrollLeft<0?this.scrollBy(-this.layout.delta,0,!0):t=this.views.first().section.prev();else if(this.isPaginated&&"vertical"===this.settings.axis){this.scrollTop=this.container.scrollTop,this.container.scrollTop>0?this.scrollBy(0,-this.layout.height,!0):t=this.views.first().section.prev()}else t=this.views.first().section.prev();else this.scrollLeft=this.container.scrollLeft,this.container.scrollLeft>0?this.scrollBy(-this.layout.delta,0,!0):t=this.views.first().section.prev();if(t){this.clear(),this.updateLayout();let e=!1;return"pre-paginated"===this.layout.name&&2===this.layout.divisor&&"object"!=typeof t.prev()&&(e=!0),this.prepend(t,e).then(function(){var e;if("pre-paginated"===this.layout.name&&this.layout.divisor>1&&(e=t.prev()))return this.prepend(e)}.bind(this),t=>t).then(function(){this.isPaginated&&"horizontal"===this.settings.axis&&("rtl"===this.settings.direction?"default"===this.settings.rtlScrollType?this.scrollTo(0,0,!0):this.scrollTo(-1*this.container.scrollWidth+this.layout.delta,0,!0):this.scrollTo(this.container.scrollWidth-this.layout.delta,0,!0)),this.views.show()}.bind(this))}}}current(){var t=this.visible();return t.length?t[t.length-1]:null}clear(){this.views&&(this.views.hide(),this.scrollTo(0,0,!0),this.views.clear())}currentLocation(){return this.updateLayout(),this.isPaginated&&"horizontal"===this.settings.axis?this.location=this.paginatedLocation():this.location=this.scrolledLocation(),this.location}scrolledLocation(){let t=this.visible(),e=this.container.getBoundingClientRect(),i=e.height<window.innerHeight?e.height:window.innerHeight,n=e.width<window.innerWidth?e.width:window.innerWidth,s="vertical"===this.settings.axis,r=(this.settings.direction,0);return this.settings.fullsize&&(r=s?window.scrollY:window.scrollX),t.map(t=>{let o,a,h,l,{index:c,href:u}=t.section,d=t.position(),f=t.width(),p=t.height();s?(o=r+e.top-d.top+0,a=o+i-0,l=this.layout.count(p,i).pages,h=i):(o=r+e.left-d.left+0,a=o+n-0,l=this.layout.count(f,n).pages,h=n);let g=Math.ceil(o/h),m=[],v=Math.ceil(a/h);if("rtl"===this.settings.direction&&!s){let t=g;g=l-v,v=l-t}m=[];for(var y=g;y<=v;y++){let t=y+1;m.push(t)}return{index:c,href:u,pages:m,totalPages:l,mapping:this.mapping.page(t.contents,t.section.cfiBase,o,a)}})}paginatedLocation(){let t=this.visible(),e=this.container.getBoundingClientRect(),i=0,n=0;return this.settings.fullsize&&(i=window.scrollX),t.map(t=>{let s,r,o,a,{index:h,href:l}=t.section,c=t.position(),u=t.width();"rtl"===this.settings.direction?(s=e.right-i,a=Math.min(Math.abs(s-c.left),this.layout.width)-n,o=c.width-(c.right-s)-n,r=o-a):(s=e.left+i,a=Math.min(c.right-s,this.layout.width)-n,r=s-c.left+n,o=r+a),n+=a;let d=this.mapping.page(t.contents,t.section.cfiBase,r,o),f=this.layout.count(u).pages,p=Math.floor(r/this.layout.pageWidth),g=[],m=Math.floor(o/this.layout.pageWidth);if(p<0&&(p=0,m+=1),"rtl"===this.settings.direction){let t=p;p=f-m,m=f-t}for(var v=p+1;v<=m;v++){let t=v;g.push(t)}return{index:h,href:l,pages:g,totalPages:f,mapping:d}})}isVisible(t,e,i,n){var s=t.position(),r=n||this.bounds();return"horizontal"===this.settings.axis&&s.right>r.left-e&&s.left<r.right+i||"vertical"===this.settings.axis&&s.bottom>r.top-e&&s.top<r.bottom+i}visible(){for(var t,e=this.bounds(),i=this.views.displayed(),n=i.length,s=[],r=0;r<n;r++)t=i[r],!0===this.isVisible(t,0,0,e)&&s.push(t);return s}scrollBy(t,e,i){let n="rtl"===this.settings.direction?-1:1;i&&(this.ignore=!0),this.settings.fullsize?window.scrollBy(t*n,e*n):(t&&(this.container.scrollLeft+=t*n),e&&(this.container.scrollTop+=e)),this.scrolled=!0}scrollTo(t,e,i){i&&(this.ignore=!0),this.settings.fullsize?window.scrollTo(t,e):(this.container.scrollLeft=t,this.container.scrollTop=e),this.scrolled=!0}onScroll(){let t,e;this.settings.fullsize?(t=window.scrollY,e=window.scrollX):(t=this.container.scrollTop,e=this.container.scrollLeft),this.scrollTop=t,this.scrollLeft=e,this.ignore?this.ignore=!1:(this.emit(f.c.MANAGERS.SCROLL,{top:t,left:e}),clearTimeout(this.afterScrolled),this.afterScrolled=setTimeout(function(){this.emit(f.c.MANAGERS.SCROLLED,{top:this.scrollTop,left:this.scrollLeft})}.bind(this),20))}bounds(){return this.stage.bounds()}applyLayout(t){this.layout=t,this.updateLayout(),this.views&&this.views.length>0&&"pre-paginated"===this.layout.name&&this.display(this.views.first().section)}updateLayout(){this.stage&&(this._stageSize=this.stage.size(),this.isPaginated?(this.layout.calculate(this._stageSize.width,this._stageSize.height,this.settings.gap),this.settings.offset=this.layout.delta/this.layout.divisor):this.layout.calculate(this._stageSize.width,this._stageSize.height),this.viewSettings.width=this.layout.width,this.viewSettings.height=this.layout.height,this.setLayout(this.layout))}setLayout(t){this.viewSettings.layout=t,this.mapping=new a.a(t.props,this.settings.direction,this.settings.axis),this.views&&this.views.forEach((function(e){e&&e.setLayout(t)}))}updateWritingMode(t){this.writingMode=t}updateAxis(t,e){(e||t!==this.settings.axis)&&(this.settings.axis=t,this.stage&&this.stage.axis(t),this.viewSettings.axis=t,this.mapping&&(this.mapping=new a.a(this.layout.props,this.settings.direction,this.settings.axis)),this.layout&&("vertical"===t?this.layout.spread("none"):this.layout.spread(this.layout.settings.spread)))}updateFlow(t,e="auto"){let i="paginated"===t||"auto"===t;this.isPaginated=i,"scrolled-doc"===t||"scrolled-continuous"===t||"scrolled"===t?this.updateAxis("vertical"):this.updateAxis("horizontal"),this.viewSettings.flow=t,this.settings.overflow?this.overflow=this.settings.overflow:this.overflow=i?"hidden":e,this.stage&&this.stage.overflow(this.overflow),this.updateLayout()}getContents(){var t=[];return this.views?(this.views.forEach((function(e){const i=e&&e.contents;i&&t.push(i)})),t):t}direction(t="ltr"){this.settings.direction=t,this.stage&&this.stage.direction(t),this.viewSettings.direction=t,this.updateLayout()}isRendered(){return this.rendered}}s()(p.prototype);e.a=p},function(t,e,i){"use strict";var n=i(2),s=i(0);e.a=class{constructor(t,e,i,n=!1){this.layout=t,this.horizontal="horizontal"===i,this.direction=e||"ltr",this._dev=n}section(t){var e=this.findRanges(t);return this.rangeListToCfiList(t.section.cfiBase,e)}page(t,e,i,s){var r,o=!(!t||!t.document)&&t.document.body;if(o){if(r=this.rangePairToCfiPair(e,{start:this.findStart(o,i,s),end:this.findEnd(o,i,s)}),!0===this._dev){let e=t.document,i=new n.a(r.start).toRange(e),s=new n.a(r.end).toRange(e),o=e.defaultView.getSelection(),a=e.createRange();o.removeAllRanges(),a.setStart(i.startContainer,i.startOffset),a.setEnd(s.endContainer,s.endOffset),o.addRange(a)}return r}}walk(t,e){if(!t||t.nodeType!==Node.TEXT_NODE){var i=function(t){return t.data.trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT},n=i;n.acceptNode=i;for(var s,r,o=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,n,!1);(s=o.nextNode())&&!(r=e(s)););return r}}findRanges(t){for(var e,i,n=[],s=t.contents.scrollWidth(),r=Math.ceil(s/this.layout.spreadWidth)*this.layout.divisor,o=this.layout.columnWidth,a=this.layout.gap,h=0;h<r.pages;h++)e=(o+a)*h,i=o*(h+1)+a*h,n.push({start:this.findStart(t.document.body,e,i),end:this.findEnd(t.document.body,e,i)});return n}findStart(t,e,i){for(var n,r,o=[t],a=t;o.length;)if(n=o.shift(),r=this.walk(n,t=>{var n,r,h,l,c;if(c=Object(s.nodeBounds)(t),this.horizontal&&"ltr"===this.direction){if(n=this.horizontal?c.left:c.top,r=this.horizontal?c.right:c.bottom,n>=e&&n<=i)return t;if(r>e)return t;a=t,o.push(t)}else if(this.horizontal&&"rtl"===this.direction){if(n=c.left,(r=c.right)<=i&&r>=e)return t;if(n<i)return t;a=t,o.push(t)}else{if(h=c.top,l=c.bottom,h>=e&&h<=i)return t;if(l>e)return t;a=t,o.push(t)}}))return this.findTextStartRange(r,e,i);return this.findTextStartRange(a,e,i)}findEnd(t,e,i){for(var n,r,o=[t],a=t;o.length;)if(n=o.shift(),r=this.walk(n,t=>{var n,r,h,l,c;if(c=Object(s.nodeBounds)(t),this.horizontal&&"ltr"===this.direction){if(n=Math.round(c.left),r=Math.round(c.right),n>i&&a)return a;if(r>i)return t;a=t,o.push(t)}else if(this.horizontal&&"rtl"===this.direction){if(n=Math.round(this.horizontal?c.left:c.top),(r=Math.round(this.horizontal?c.right:c.bottom))<e&&a)return a;if(n<e)return t;a=t,o.push(t)}else{if(h=Math.round(c.top),l=Math.round(c.bottom),h>i&&a)return a;if(l>i)return t;a=t,o.push(t)}}))return this.findTextEndRange(r,e,i);return this.findTextEndRange(a,e,i)}findTextStartRange(t,e,i){for(var n,s,r=this.splitTextNodeIntoRanges(t),o=0;o<r.length;o++)if(s=(n=r[o]).getBoundingClientRect(),this.horizontal&&"ltr"===this.direction){if(s.left>=e)return n}else if(this.horizontal&&"rtl"===this.direction){if(s.right<=i)return n}else if(s.top>=e)return n;return r[0]}findTextEndRange(t,e,i){for(var n,s,r,o,a,h,l,c=this.splitTextNodeIntoRanges(t),u=0;u<c.length;u++){if(r=(s=c[u]).getBoundingClientRect(),this.horizontal&&"ltr"===this.direction){if(o=r.left,a=r.right,o>i&&n)return n;if(a>i)return s}else if(this.horizontal&&"rtl"===this.direction){if(o=r.left,(a=r.right)<e&&n)return n;if(o<e)return s}else{if(h=r.top,l=r.bottom,h>i&&n)return n;if(l>i)return s}n=s}return c[c.length-1]}splitTextNodeIntoRanges(t,e){var i,n=[],s=(t.textContent||"").trim(),r=t.ownerDocument,o=e||" ",a=s.indexOf(o);if(-1===a||t.nodeType!=Node.TEXT_NODE)return(i=r.createRange()).selectNodeContents(t),[i];for((i=r.createRange()).setStart(t,0),i.setEnd(t,a),n.push(i),i=!1;-1!=a;)(a=s.indexOf(o,a+1))>0&&(i&&(i.setEnd(t,a),n.push(i)),(i=r.createRange()).setStart(t,a+1));return i&&(i.setEnd(t,s.length),n.push(i)),n}rangePairToCfiPair(t,e){var i=e.start,s=e.end;return i.collapse(!0),s.collapse(!1),{start:new n.a(i,t).toString(),end:new n.a(s,t).toString()}}rangeListToCfiList(t,e){for(var i,n=[],s=0;s<e.length;s++)i=this.rangePairToCfiPair(t,e[s]),n.push(i);return n}axis(t){return t&&(this.horizontal="horizontal"===t),this.horizontal}}},function(t,e,i){"use strict";var n=i(3),s=i.n(n),r=i(0),o=i(2),a=i(11),h=i(8),l=i(1);const c="undefined"!=typeof navigator,u=c&&/Chrome/.test(navigator.userAgent),d=c&&!u&&/AppleWebKit/.test(navigator.userAgent);class f{constructor(t,e,i,n){this.epubcfi=new o.a,this.document=t,this.documentElement=this.document.documentElement,this.content=e||this.document.body,this.window=this.document.defaultView,this._size={width:0,height:0},this.sectionIndex=n||0,this.cfiBase=i||"",this.epubReadingSystem("epub.js",l.b),this.called=0,this.active=!0,this.listeners()}static get listenedEvents(){return l.a}width(t){var e=this.content;return t&&Object(r.isNumber)(t)&&(t+="px"),t&&(e.style.width=t),parseInt(this.window.getComputedStyle(e).width)}height(t){var e=this.content;return t&&Object(r.isNumber)(t)&&(t+="px"),t&&(e.style.height=t),parseInt(this.window.getComputedStyle(e).height)}contentWidth(t){var e=this.content||this.document.body;return t&&Object(r.isNumber)(t)&&(t+="px"),t&&(e.style.width=t),parseInt(this.window.getComputedStyle(e).width)}contentHeight(t){var e=this.content||this.document.body;return t&&Object(r.isNumber)(t)&&(t+="px"),t&&(e.style.height=t),parseInt(this.window.getComputedStyle(e).height)}textWidth(){let t,e,i=this.document.createRange(),n=this.content||this.document.body,s=Object(r.borders)(n);return i.selectNodeContents(n),t=i.getBoundingClientRect(),e=t.width,s&&s.width&&(e+=s.width),Math.round(e)}textHeight(){let t,e,i=this.document.createRange(),n=this.content||this.document.body;return i.selectNodeContents(n),t=i.getBoundingClientRect(),e=t.bottom,Math.round(e)}scrollWidth(){return this.documentElement.scrollWidth}scrollHeight(){return this.documentElement.scrollHeight}overflow(t){return t&&(this.documentElement.style.overflow=t),this.window.getComputedStyle(this.documentElement).overflow}overflowX(t){return t&&(this.documentElement.style.overflowX=t),this.window.getComputedStyle(this.documentElement).overflowX}overflowY(t){return t&&(this.documentElement.style.overflowY=t),this.window.getComputedStyle(this.documentElement).overflowY}css(t,e,i){var n=this.content||this.document.body;return e?n.style.setProperty(t,e,i?"important":""):n.style.removeProperty(t),this.window.getComputedStyle(n)[t]}viewport(t){var e,i=this.document.querySelector("meta[name='viewport']"),n={width:void 0,height:void 0,scale:void 0,minimum:void 0,maximum:void 0,scalable:void 0},s=[];if(i&&i.hasAttribute("content")){let t=i.getAttribute("content"),e=t.match(/width\\s*=\\s*([^,]*)/),s=t.match(/height\\s*=\\s*([^,]*)/),r=t.match(/initial-scale\\s*=\\s*([^,]*)/),o=t.match(/minimum-scale\\s*=\\s*([^,]*)/),a=t.match(/maximum-scale\\s*=\\s*([^,]*)/),h=t.match(/user-scalable\\s*=\\s*([^,]*)/);e&&e.length&&void 0!==e[1]&&(n.width=e[1]),s&&s.length&&void 0!==s[1]&&(n.height=s[1]),r&&r.length&&void 0!==r[1]&&(n.scale=r[1]),o&&o.length&&void 0!==o[1]&&(n.minimum=o[1]),a&&a.length&&void 0!==a[1]&&(n.maximum=a[1]),h&&h.length&&void 0!==h[1]&&(n.scalable=h[1])}return e=Object(r.defaults)(t||{},n),t&&(e.width&&s.push("width="+e.width),e.height&&s.push("height="+e.height),e.scale&&s.push("initial-scale="+e.scale),"no"===e.scalable?(s.push("minimum-scale="+e.scale),s.push("maximum-scale="+e.scale),s.push("user-scalable="+e.scalable)):(e.scalable&&s.push("user-scalable="+e.scalable),e.minimum&&s.push("minimum-scale="+e.minimum),e.maximum&&s.push("minimum-scale="+e.maximum)),i||((i=this.document.createElement("meta")).setAttribute("name","viewport"),this.document.querySelector("head").appendChild(i)),i.setAttribute("content",s.join(", ")),this.window.scrollTo(0,0)),e}expand(){this.emit(l.c.CONTENTS.EXPAND)}listeners(){this.imageLoadListeners(),this.mediaQueryListeners(),this.addEventListeners(),this.addSelectionListeners(),"undefined"==typeof ResizeObserver?(this.resizeListeners(),this.visibilityListeners()):this.resizeObservers(),this.linksHandler()}removeListeners(){this.removeEventListeners(),this.removeSelectionListeners(),this.observer&&this.observer.disconnect(),clearTimeout(this.expanding)}resizeCheck(){let t=this.textWidth(),e=this.textHeight();t==this._size.width&&e==this._size.height||(this._size={width:t,height:e},this.onResize&&this.onResize(this._size),this.emit(l.c.CONTENTS.RESIZE,this._size))}resizeListeners(){clearTimeout(this.expanding),requestAnimationFrame(this.resizeCheck.bind(this)),this.expanding=setTimeout(this.resizeListeners.bind(this),350)}visibilityListeners(){document.addEventListener("visibilitychange",()=>{"visible"===document.visibilityState&&!1===this.active?(this.active=!0,this.resizeListeners()):(this.active=!1,clearTimeout(this.expanding))})}transitionListeners(){let t=this.content;t.style.transitionProperty="font, font-size, font-size-adjust, font-stretch, font-variation-settings, font-weight, width, height",t.style.transitionDuration="0.001ms",t.style.transitionTimingFunction="linear",t.style.transitionDelay="0",this._resizeCheck=this.resizeCheck.bind(this),this.document.addEventListener("transitionend",this._resizeCheck)}mediaQueryListeners(){for(var t=this.document.styleSheets,e=function(t){t.matches&&!this._expanding&&setTimeout(this.expand.bind(this),1)}.bind(this),i=0;i<t.length;i+=1){var n;try{n=t[i].cssRules}catch(t){return}if(!n)return;for(var s=0;s<n.length;s+=1){if(n[s].media)this.window.matchMedia(n[s].media.mediaText).addListener(e)}}}resizeObservers(){this.observer=new ResizeObserver(t=>{requestAnimationFrame(this.resizeCheck.bind(this))}),this.observer.observe(this.document.documentElement)}mutationObservers(){this.observer=new MutationObserver(t=>{this.resizeCheck()});this.observer.observe(this.document,{attributes:!0,childList:!0,characterData:!0,subtree:!0})}imageLoadListeners(){for(var t,e=this.document.querySelectorAll("img"),i=0;i<e.length;i++)void 0!==(t=e[i]).naturalWidth&&0===t.naturalWidth&&(t.onload=this.expand.bind(this))}fontLoadListeners(){this.document&&this.document.fonts&&this.document.fonts.ready.then(function(){this.resizeCheck()}.bind(this))}root(){return this.document?this.document.documentElement:null}locationOf(t,e){var i,n={left:0,top:0};if(!this.document)return n;if(this.epubcfi.isCfiString(t)){let s=new o.a(t).toRange(this.document,e);if(s){try{if(!s.endContainer||s.startContainer==s.endContainer&&s.startOffset==s.endOffset){let t=s.startContainer.textContent.indexOf(" ",s.startOffset);-1==t&&(t=s.startContainer.textContent.length),s.setEnd(s.startContainer,t)}}catch(t){console.error("setting end offset to start container length failed",t)}if(s.startContainer.nodeType===Node.ELEMENT_NODE)i=s.startContainer.getBoundingClientRect(),n.left=i.left,n.top=i.top;else if(d){let t=s.startContainer,e=new Range;try{1===t.nodeType?i=t.getBoundingClientRect():s.startOffset+2<t.length?(e.setStart(t,s.startOffset),e.setEnd(t,s.startOffset+2),i=e.getBoundingClientRect()):s.startOffset-2>0?(e.setStart(t,s.startOffset-2),e.setEnd(t,s.startOffset),i=e.getBoundingClientRect()):i=t.parentNode.getBoundingClientRect()}catch(t){console.error(t,t.stack)}}else i=s.getBoundingClientRect()}}else if("string"==typeof t&&t.indexOf("#")>-1){let e=t.substring(t.indexOf("#")+1),n=this.document.getElementById(e);if(n)if(d){let t=new Range;t.selectNode(n),i=t.getBoundingClientRect()}else i=n.getBoundingClientRect()}return i&&(n.left=i.left,n.top=i.top),n}addStylesheet(t){return new Promise(function(e,i){var n,s=!1;this.document?(n=this.document.querySelector("link[href='"+t+"']"))?e(!0):((n=this.document.createElement("link")).type="text/css",n.rel="stylesheet",n.href=t,n.onload=n.onreadystatechange=function(){s||this.readyState&&"complete"!=this.readyState||(s=!0,setTimeout(()=>{e(!0)},1))},this.document.head.appendChild(n)):e(!1)}.bind(this))}_getStylesheetNode(t){var e;return t="epubjs-inserted-css-"+(t||""),!!this.document&&((e=this.document.getElementById(t))||((e=this.document.createElement("style")).id=t,this.document.head.appendChild(e)),e)}addStylesheetCss(t,e){return!(!this.document||!t)&&(this._getStylesheetNode(e).innerHTML=t,!0)}addStylesheetRules(t,e){var i;if(this.document&&t&&0!==t.length)if(i=this._getStylesheetNode(e).sheet,"[object Array]"===Object.prototype.toString.call(t))for(var n=0,s=t.length;n<s;n++){var r=1,o=t[n],a=t[n][0],h="";"[object Array]"===Object.prototype.toString.call(o[1][0])&&(o=o[1],r=0);for(var l=o.length;r<l;r++){var c=o[r];h+=c[0]+":"+c[1]+(c[2]?" !important":"")+";\\n"}i.insertRule(a+"{"+h+"}",i.cssRules.length)}else{Object.keys(t).forEach(e=>{const n=t[e];if(Array.isArray(n))n.forEach(t=>{const n=Object.keys(t).map(e=>\`\${e}:\${t[e]}\`).join(";");i.insertRule(\`\${e}{\${n}}\`,i.cssRules.length)});else{const t=Object.keys(n).map(t=>\`\${t}:\${n[t]}\`).join(";");i.insertRule(\`\${e}{\${t}}\`,i.cssRules.length)}})}}addScript(t){return new Promise(function(e,i){var n,s=!1;this.document?((n=this.document.createElement("script")).type="text/javascript",n.async=!0,n.src=t,n.onload=n.onreadystatechange=function(){s||this.readyState&&"complete"!=this.readyState||(s=!0,setTimeout((function(){e(!0)}),1))},this.document.head.appendChild(n)):e(!1)}.bind(this))}addClass(t){var e;this.document&&(e=this.content||this.document.body)&&e.classList.add(t)}removeClass(t){var e;this.document&&(e=this.content||this.document.body)&&e.classList.remove(t)}addEventListeners(){this.document&&(this._triggerEvent=this.triggerEvent.bind(this),l.a.forEach((function(t){this.document.addEventListener(t,this._triggerEvent,{passive:!0})}),this))}removeEventListeners(){this.document&&(l.a.forEach((function(t){this.document.removeEventListener(t,this._triggerEvent,{passive:!0})}),this),this._triggerEvent=void 0)}triggerEvent(t){this.emit(t.type,t)}addSelectionListeners(){this.document&&(this._onSelectionChange=this.onSelectionChange.bind(this),this.document.addEventListener("selectionchange",this._onSelectionChange,{passive:!0}))}removeSelectionListeners(){this.document&&(this.document.removeEventListener("selectionchange",this._onSelectionChange,{passive:!0}),this._onSelectionChange=void 0)}onSelectionChange(t){this.selectionEndTimeout&&clearTimeout(this.selectionEndTimeout),this.selectionEndTimeout=setTimeout(function(){var t=this.window.getSelection();this.triggerSelectedEvent(t)}.bind(this),250)}triggerSelectedEvent(t){var e,i;t&&t.rangeCount>0&&((e=t.getRangeAt(0)).collapsed||(i=new o.a(e,this.cfiBase).toString(),this.emit(l.c.CONTENTS.SELECTED,i),this.emit(l.c.CONTENTS.SELECTED_RANGE,e)))}range(t,e){return new o.a(t).toRange(this.document,e)}cfiFromRange(t,e){return new o.a(t,this.cfiBase,e).toString()}cfiFromNode(t,e){return new o.a(t,this.cfiBase,e).toString()}map(t){return new a.a(t).section()}size(t,e){var i={scale:1,scalable:"no"};this.layoutStyle("scrolling"),t>=0&&(this.width(t),i.width=t,this.css("padding","0 "+t/12+"px")),e>=0&&(this.height(e),i.height=e),this.css("margin","0"),this.css("box-sizing","border-box"),this.viewport(i)}columns(t,e,i,n,s){let o=Object(r.prefixed)("column-axis"),a=Object(r.prefixed)("column-gap"),h=Object(r.prefixed)("column-width"),l=Object(r.prefixed)("column-fill"),c=0===this.writingMode().indexOf("vertical")?"vertical":"horizontal";this.layoutStyle("paginated"),"rtl"===s&&"horizontal"===c&&this.direction(s),this.width(t),this.height(e),this.viewport({width:t,height:e,scale:1,scalable:"no"}),this.css("overflow-y","hidden"),this.css("margin","0",!0),"vertical"===c?(this.css("padding-top",n/2+"px",!0),this.css("padding-bottom",n/2+"px",!0),this.css("padding-left","20px"),this.css("padding-right","20px"),this.css(o,"vertical")):(this.css("padding-top","20px"),this.css("padding-bottom","20px"),this.css("padding-left",n/2+"px",!0),this.css("padding-right",n/2+"px",!0),this.css(o,"horizontal")),this.css("box-sizing","border-box"),this.css("max-width","inherit"),this.css(l,"auto"),this.css(a,n+"px"),this.css(h,i+"px"),this.css("-webkit-line-box-contain","block glyphs replaced")}scaler(t,e,i){var n="scale("+t+")",s="";this.css("transform-origin","top left"),(e>=0||i>=0)&&(s=" translate("+(e||0)+"px, "+(i||0)+"px )"),this.css("transform",n+s)}fit(t,e,i){var n=this.viewport(),s=parseInt(n.width),r=parseInt(n.height),o=t/s,a=e/r,h=o<a?o:a;if(this.layoutStyle("paginated"),this.width(s),this.height(r),this.overflow("hidden"),this.scaler(h,0,0),this.css("background-size",s*h+"px "+r*h+"px"),this.css("background-color","transparent"),i&&i.properties.includes("page-spread-left")){var l=t-s*h;this.css("margin-left",l+"px")}}direction(t){this.documentElement&&(this.documentElement.style.direction=t)}mapPage(t,e,i,n,s){return new a.a(e,s).page(this,t,i,n)}linksHandler(){Object(h.c)(this.content,t=>{this.emit(l.c.CONTENTS.LINK_CLICKED,t)})}writingMode(t){let e=Object(r.prefixed)("writing-mode");return t&&this.documentElement&&(this.documentElement.style[e]=t),this.window.getComputedStyle(this.documentElement)[e]||""}layoutStyle(t){return t&&(this._layoutStyle=t,navigator.epubReadingSystem.layoutStyle=this._layoutStyle),this._layoutStyle||"paginated"}epubReadingSystem(t,e){return navigator.epubReadingSystem={name:t,version:e,layoutStyle:this.layoutStyle(),hasFeature:function(t){switch(t){case"dom-manipulation":case"layout-changes":case"touch-events":case"mouse-events":case"keyboard-events":return!0;case"spine-scripting":default:return!1}}},navigator.epubReadingSystem}destroy(){this.removeListeners()}}s()(f.prototype),e.a=f},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Underline=e.Highlight=e.Mark=e.Pane=void 0;var n=function(){function t(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}}(),s=o(i(49)),r=o(i(50));function o(t){return t&&t.__esModule?t:{default:t}}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function h(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function l(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.Pane=function(){function t(e){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document.body;l(this,t),this.target=e,this.element=s.default.createElement("svg"),this.marks=[],this.element.style.position="absolute",this.element.setAttribute("pointer-events","none"),r.default.proxyMouse(this.target,this.marks),this.container=i,this.container.appendChild(this.element),this.render()}return n(t,[{key:"addMark",value:function(t){var e=s.default.createElement("g");return this.element.appendChild(e),t.bind(e,this.container),this.marks.push(t),t.render(),t}},{key:"removeMark",value:function(t){var e=this.marks.indexOf(t);if(-1!==e){var i=t.unbind();this.element.removeChild(i),this.marks.splice(e,1)}}},{key:"render",value:function(){var t,e,i,n;!function(t,e){t.style.setProperty("top",e.top+"px","important"),t.style.setProperty("left",e.left+"px","important"),t.style.setProperty("height",e.height+"px","important"),t.style.setProperty("width",e.width+"px","important")}(this.element,(t=this.target,e=this.container,i=e.getBoundingClientRect(),n=t.getBoundingClientRect(),{top:n.top-i.top,left:n.left-i.left,height:t.scrollHeight,width:t.scrollWidth}));var s=!0,r=!1,o=void 0;try{for(var a,h=this.marks[Symbol.iterator]();!(s=(a=h.next()).done);s=!0){a.value.render()}}catch(t){r=!0,o=t}finally{try{!s&&h.return&&h.return()}finally{if(r)throw o}}}}]),t}();var c=e.Mark=function(){function t(){l(this,t),this.element=null}return n(t,[{key:"bind",value:function(t,e){this.element=t,this.container=e}},{key:"unbind",value:function(){var t=this.element;return this.element=null,t}},{key:"render",value:function(){}},{key:"dispatchEvent",value:function(t){this.element&&this.element.dispatchEvent(t)}},{key:"getBoundingClientRect",value:function(){return this.element.getBoundingClientRect()}},{key:"getClientRects",value:function(){for(var t=[],e=this.element.firstChild;e;)t.push(e.getBoundingClientRect()),e=e.nextSibling;return t}},{key:"filteredRanges",value:function(){var t=Array.from(this.range.getClientRects());return t.filter((function(e){for(var i=0;i<t.length;i++){if(t[i]===e)return!0;if(n=t[i],(s=e).right<=n.right&&s.left>=n.left&&s.top>=n.top&&s.bottom<=n.bottom)return!1}var n,s;return!0}))}}]),t}(),u=e.Highlight=function(t){function e(t,i,n,s){l(this,e);var r=a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return r.range=t,r.className=i,r.data=n||{},r.attributes=s||{},r}return h(e,t),n(e,[{key:"bind",value:function(t,i){for(var n in function t(e,i,n){null===e&&(e=Function.prototype);var s=Object.getOwnPropertyDescriptor(e,i);if(void 0===s){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,i,n)}if("value"in s)return s.value;var o=s.get;return void 0!==o?o.call(n):void 0}(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"bind",this).call(this,t,i),this.data)this.data.hasOwnProperty(n)&&(this.element.dataset[n]=this.data[n]);for(var n in this.attributes)this.attributes.hasOwnProperty(n)&&this.element.setAttribute(n,this.attributes[n]);this.className&&this.element.classList.add(this.className)}},{key:"render",value:function(){for(;this.element.firstChild;)this.element.removeChild(this.element.firstChild);for(var t=this.element.ownerDocument.createDocumentFragment(),e=this.filteredRanges(),i=this.element.getBoundingClientRect(),n=this.container.getBoundingClientRect(),r=0,o=e.length;r<o;r++){var a=e[r],h=s.default.createElement("rect");h.setAttribute("x",a.left-i.left+n.left),h.setAttribute("y",a.top-i.top+n.top),h.setAttribute("height",a.height),h.setAttribute("width",a.width),t.appendChild(h)}this.element.appendChild(t)}}]),e}(c);e.Underline=function(t){function e(t,i,n,s){return l(this,e),a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i,n,s))}return h(e,t),n(e,[{key:"render",value:function(){for(;this.element.firstChild;)this.element.removeChild(this.element.firstChild);for(var t=this.element.ownerDocument.createDocumentFragment(),e=this.filteredRanges(),i=this.element.getBoundingClientRect(),n=this.container.getBoundingClientRect(),r=0,o=e.length;r<o;r++){var a=e[r],h=s.default.createElement("rect");h.setAttribute("x",a.left-i.left+n.left),h.setAttribute("y",a.top-i.top+n.top),h.setAttribute("height",a.height),h.setAttribute("width",a.width),h.setAttribute("fill","none");var l=s.default.createElement("line");l.setAttribute("x1",a.left-i.left+n.left),l.setAttribute("x2",a.left-i.left+n.left+a.width),l.setAttribute("y1",a.top-i.top+n.top+a.height-1),l.setAttribute("y2",a.top-i.top+n.top+a.height-1),l.setAttribute("stroke-width",1),l.setAttribute("stroke","black"),l.setAttribute("stroke-linecap","square"),t.appendChild(h),t.appendChild(l)}this.element.appendChild(t)}}]),e}(u)},function(t,e,i){"use strict";function n(t,e){return void 0===e&&(e=Object),e&&"function"==typeof e.freeze?e.freeze(t):t}var s=n({HTML:"text/html",isHTML:function(t){return t===s.HTML},XML_APPLICATION:"application/xml",XML_TEXT:"text/xml",XML_XHTML_APPLICATION:"application/xhtml+xml",XML_SVG_IMAGE:"image/svg+xml"}),r=n({HTML:"http://www.w3.org/1999/xhtml",isHTML:function(t){return t===r.HTML},SVG:"http://www.w3.org/2000/svg",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"});e.freeze=n,e.MIME_TYPE=s,e.NAMESPACE=r},function(t,e,i){var n=i(25);e.DOMImplementation=n.DOMImplementation,e.XMLSerializer=n.XMLSerializer,e.DOMParser=i(46).DOMParser},function(t,e,i){"use strict";var n=i(3),s=i.n(n),r=i(0),o=i(6),a=i(2),h=i(9),l=i(1);class c{constructor(t){this.settings=t,this.name=t.layout||"reflowable",this._spread="none"!==t.spread,this._minSpreadWidth=t.minSpreadWidth||800,this._evenSpreads=t.evenSpreads||!1,"scrolled"===t.flow||"scrolled-continuous"===t.flow||"scrolled-doc"===t.flow?this._flow="scrolled":this._flow="paginated",this.width=0,this.height=0,this.spreadWidth=0,this.delta=0,this.columnWidth=0,this.gap=0,this.divisor=1,this.props={name:this.name,spread:this._spread,flow:this._flow,width:0,height:0,spreadWidth:0,delta:0,columnWidth:0,gap:0,divisor:1}}flow(t){return void 0!==t&&(this._flow="scrolled"===t||"scrolled-continuous"===t||"scrolled-doc"===t?"scrolled":"paginated",this.update({flow:this._flow})),this._flow}spread(t,e){return t&&(this._spread="none"!==t,this.update({spread:this._spread})),e>=0&&(this._minSpreadWidth=e),this._spread}calculate(t,e,i){var n,s,r,o,a=1,h=i||0,l=t,c=e,u=Math.floor(l/12);a=this._spread&&l>=this._minSpreadWidth?2:1,"reflowable"!==this.name||"paginated"!==this._flow||i>=0||(h=u%2==0?u:u-1),"pre-paginated"===this.name&&(h=0),a>1?r=(n=l/a-h)+h:(n=l,r=l),"pre-paginated"===this.name&&a>1&&(l=n),s=n*a+h,o=l,this.width=l,this.height=c,this.spreadWidth=s,this.pageWidth=r,this.delta=o,this.columnWidth=n,this.gap=h,this.divisor=a,this.update({width:l,height:c,spreadWidth:s,pageWidth:r,delta:o,columnWidth:n,gap:h,divisor:a})}format(t,e,i){return"pre-paginated"===this.name?t.fit(this.columnWidth,this.height,e):"paginated"===this._flow?t.columns(this.width,this.height,this.columnWidth,this.gap,this.settings.direction):i&&"horizontal"===i?t.size(null,this.height):t.size(this.width,null)}count(t,e){let i,n;return"pre-paginated"===this.name?(i=1,n=1):"paginated"===this._flow?(e=e||this.delta,i=Math.ceil(t/e),n=i*this.divisor):(e=e||this.height,i=Math.ceil(t/e),n=i),{spreads:i,pages:n}}update(t){if(Object.keys(t).forEach(e=>{this.props[e]===t[e]&&delete t[e]}),Object.keys(t).length>0){let e=Object(r.extend)(this.props,t);this.emit(l.c.LAYOUT.UPDATED,e,t)}}}s()(c.prototype);var u=c,d=i(5);var f=class{constructor(t){this.rendition=t,this._themes={default:{rules:{},url:"",serialized:""}},this._overrides={},this._current="default",this._injected=[],this.rendition.hooks.content.register(this.inject.bind(this)),this.rendition.hooks.content.register(this.overrides.bind(this))}register(){if(0!==arguments.length)return 1===arguments.length&&"object"==typeof arguments[0]?this.registerThemes(arguments[0]):1===arguments.length&&"string"==typeof arguments[0]?this.default(arguments[0]):2===arguments.length&&"string"==typeof arguments[1]?this.registerUrl(arguments[0],arguments[1]):2===arguments.length&&"object"==typeof arguments[1]?this.registerRules(arguments[0],arguments[1]):void 0}default(t){if(t)return"string"==typeof t?this.registerUrl("default",t):"object"==typeof t?this.registerRules("default",t):void 0}registerThemes(t){for(var e in t)t.hasOwnProperty(e)&&("string"==typeof t[e]?this.registerUrl(e,t[e]):this.registerRules(e,t[e]))}registerCss(t,e){this._themes[t]={serialized:e},(this._injected[t]||"default"==t)&&this.update(t)}registerUrl(t,e){var i=new d.a(e);this._themes[t]={url:i.toString()},(this._injected[t]||"default"==t)&&this.update(t)}registerRules(t,e){this._themes[t]={rules:e},(this._injected[t]||"default"==t)&&this.update(t)}select(t){var e=this._current;this._current=t,this.update(t),this.rendition.getContents().forEach(i=>{i.removeClass(e),i.addClass(t)})}update(t){this.rendition.getContents().forEach(e=>{this.add(t,e)})}inject(t){var e,i=[],n=this._themes;for(var s in n)!n.hasOwnProperty(s)||s!==this._current&&"default"!==s||(((e=n[s]).rules&&Object.keys(e.rules).length>0||e.url&&-1===i.indexOf(e.url))&&this.add(s,t),this._injected.push(s));"default"!=this._current&&t.addClass(this._current)}add(t,e){var i=this._themes[t];i&&e&&(i.url?e.addStylesheet(i.url):i.serialized?(e.addStylesheetCss(i.serialized,t),i.injected=!0):i.rules&&(e.addStylesheetRules(i.rules,t),i.injected=!0))}override(t,e,i){var n=this.rendition.getContents();this._overrides[t]={value:e,priority:!0===i},n.forEach(e=>{e.css(t,this._overrides[t].value,this._overrides[t].priority)})}removeOverride(t){var e=this.rendition.getContents();delete this._overrides[t],e.forEach(e=>{e.css(t)})}overrides(t){var e=this._overrides;for(var i in e)e.hasOwnProperty(i)&&t.css(i,e[i].value,e[i].priority)}fontSize(t){this.override("font-size",t)}font(t){this.override("font-family",t,!0)}destroy(){this.rendition=void 0,this._themes=void 0,this._overrides=void 0,this._current=void 0,this._injected=void 0}};i(12);class p{constructor({type:t,cfiRange:e,data:i,sectionIndex:n,cb:s,className:r,styles:o}){this.type=t,this.cfiRange=e,this.data=i,this.sectionIndex=n,this.mark=void 0,this.cb=s,this.className=r,this.styles=o}update(t){this.data=t}attach(t){let e,{cfiRange:i,data:n,type:s,mark:r,cb:o,className:a,styles:h}=this;return"highlight"===s?e=t.highlight(i,n,o,a,h):"underline"===s?e=t.underline(i,n,o,a,h):"mark"===s&&(e=t.mark(i,n,o)),this.mark=e,this.emit(l.c.ANNOTATION.ATTACH,e),e}detach(t){let e,{cfiRange:i,type:n}=this;return t&&("highlight"===n?e=t.unhighlight(i):"underline"===n?e=t.ununderline(i):"mark"===n&&(e=t.unmark(i))),this.mark=void 0,this.emit(l.c.ANNOTATION.DETACH,e),e}text(){}}s()(p.prototype);var g=class{constructor(t){this.rendition=t,this.highlights=[],this.underlines=[],this.marks=[],this._annotations={},this._annotationsBySectionIndex={},this.rendition.hooks.render.register(this.inject.bind(this)),this.rendition.hooks.unloaded.register(this.clear.bind(this))}add(t,e,i,n,s,r){let o=encodeURI(e+t),h=new a.a(e).spinePos,l=new p({type:t,cfiRange:e,data:i,sectionIndex:h,cb:n,className:s,styles:r});return this._annotations[o]=l,h in this._annotationsBySectionIndex?this._annotationsBySectionIndex[h].push(o):this._annotationsBySectionIndex[h]=[o],this.rendition.views().forEach(t=>{l.sectionIndex===t.index&&l.attach(t)}),l}remove(t,e){let i=encodeURI(t+e);if(i in this._annotations){let t=this._annotations[i];if(e&&t.type!==e)return;this.rendition.views().forEach(e=>{this._removeFromAnnotationBySectionIndex(t.sectionIndex,i),t.sectionIndex===e.index&&t.detach(e)}),delete this._annotations[i]}}_removeFromAnnotationBySectionIndex(t,e){this._annotationsBySectionIndex[t]=this._annotationsAt(t).filter(t=>t!==e)}_annotationsAt(t){return this._annotationsBySectionIndex[t]}highlight(t,e,i,n,s){return this.add("highlight",t,e,i,n,s)}underline(t,e,i,n,s){return this.add("underline",t,e,i,n,s)}mark(t,e,i){return this.add("mark",t,e,i)}each(){return this._annotations.forEach.apply(this._annotations,arguments)}inject(t){let e=t.index;if(e in this._annotationsBySectionIndex){this._annotationsBySectionIndex[e].forEach(e=>{this._annotations[e].attach(t)})}}clear(t){let e=t.index;if(e in this._annotationsBySectionIndex){this._annotationsBySectionIndex[e].forEach(e=>{this._annotations[e].detach(t)})}}show(){}hide(){}},m=i(20),v=i(10),y=i(22);class b{constructor(t,e){this.settings=Object(r.extend)(this.settings||{},{width:null,height:null,ignoreClass:"",manager:"default",view:"iframe",flow:null,layout:null,spread:null,minSpreadWidth:800,stylesheet:null,resizeOnOrientationChange:!0,script:null,snap:!1,defaultDirection:"ltr",allowScriptedContent:!1,allowPopups:!1}),Object(r.extend)(this.settings,e),"object"==typeof this.settings.manager&&(this.manager=this.settings.manager),this.book=t,this.hooks={},this.hooks.display=new o.a(this),this.hooks.serialize=new o.a(this),this.hooks.content=new o.a(this),this.hooks.unloaded=new o.a(this),this.hooks.layout=new o.a(this),this.hooks.render=new o.a(this),this.hooks.show=new o.a(this),this.hooks.content.register(this.handleLinks.bind(this)),this.hooks.content.register(this.passEvents.bind(this)),this.hooks.content.register(this.adjustImages.bind(this)),this.book.spine.hooks.content.register(this.injectIdentifier.bind(this)),this.settings.stylesheet&&this.book.spine.hooks.content.register(this.injectStylesheet.bind(this)),this.settings.script&&this.book.spine.hooks.content.register(this.injectScript.bind(this)),this.themes=new f(this),this.annotations=new g(this),this.epubcfi=new a.a,this.q=new h.a(this),this.location=void 0,this.q.enqueue(this.book.opened),this.starting=new r.defer,this.started=this.starting.promise,this.q.enqueue(this.start)}setManager(t){this.manager=t}requireManager(t){return"string"==typeof t&&"default"===t?v.a:"string"==typeof t&&"continuous"===t?y.a:t}requireView(t){return"string"==typeof t&&"iframe"===t?m.a:t}start(){switch(this.settings.layout||"pre-paginated"!==this.book.package.metadata.layout&&"true"!==this.book.displayOptions.fixedLayout||(this.settings.layout="pre-paginated"),this.book.package.metadata.spread){case"none":this.settings.spread="none";break;case"both":this.settings.spread=!0}this.manager||(this.ViewManager=this.requireManager(this.settings.manager),this.View=this.requireView(this.settings.view),this.manager=new this.ViewManager({view:this.View,queue:this.q,request:this.book.load.bind(this.book),settings:this.settings})),this.direction(this.book.package.metadata.direction||this.settings.defaultDirection),this.settings.globalLayoutProperties=this.determineLayoutProperties(this.book.package.metadata),this.flow(this.settings.globalLayoutProperties.flow),this.layout(this.settings.globalLayoutProperties),this.manager.on(l.c.MANAGERS.ADDED,this.afterDisplayed.bind(this)),this.manager.on(l.c.MANAGERS.REMOVED,this.afterRemoved.bind(this)),this.manager.on(l.c.MANAGERS.RESIZED,this.onResized.bind(this)),this.manager.on(l.c.MANAGERS.ORIENTATION_CHANGE,this.onOrientationChange.bind(this)),this.manager.on(l.c.MANAGERS.SCROLLED,this.reportLocation.bind(this)),this.emit(l.c.RENDITION.STARTED),this.starting.resolve()}attachTo(t){return this.q.enqueue(function(){this.manager.render(t,{width:this.settings.width,height:this.settings.height}),this.emit(l.c.RENDITION.ATTACHED)}.bind(this))}display(t){return this.displaying&&this.displaying.resolve(),this.q.enqueue(this._display,t)}_display(t){if(this.book){this.epubcfi.isCfiString(t);var e,i=new r.defer,n=i.promise;return this.displaying=i,this.book.locations.length()&&Object(r.isFloat)(t)&&(t=this.book.locations.cfiFromPercentage(parseFloat(t))),(e=this.book.spine.get(t))?(this.manager.display(e,t).then(()=>{i.resolve(e),this.displaying=void 0,this.emit(l.c.RENDITION.DISPLAYED,e),this.reportLocation()},t=>{this.emit(l.c.RENDITION.DISPLAY_ERROR,t)}),n):(i.reject(new Error("No Section Found")),n)}}afterDisplayed(t){t.on(l.c.VIEWS.MARK_CLICKED,(e,i)=>this.triggerMarkEvent(e,i,t.contents)),this.hooks.render.trigger(t,this).then(()=>{t.contents?this.hooks.content.trigger(t.contents,this).then(()=>{this.emit(l.c.RENDITION.RENDERED,t.section,t)}):this.emit(l.c.RENDITION.RENDERED,t.section,t)})}afterRemoved(t){this.hooks.unloaded.trigger(t,this).then(()=>{this.emit(l.c.RENDITION.REMOVED,t.section,t)})}onResized(t,e){this.emit(l.c.RENDITION.RESIZED,{width:t.width,height:t.height},e),this.location&&this.location.start&&this.display(e||this.location.start.cfi)}onOrientationChange(t){this.emit(l.c.RENDITION.ORIENTATION_CHANGE,t)}moveTo(t){this.manager.moveTo(t)}resize(t,e,i){t&&(this.settings.width=t),e&&(this.settings.height=e),this.manager.resize(t,e,i)}clear(){this.manager.clear()}next(){return this.q.enqueue(this.manager.next.bind(this.manager)).then(this.reportLocation.bind(this))}prev(){return this.q.enqueue(this.manager.prev.bind(this.manager)).then(this.reportLocation.bind(this))}determineLayoutProperties(t){var e=this.settings.layout||t.layout||"reflowable",i=this.settings.spread||t.spread||"auto",n=this.settings.orientation||t.orientation||"auto",s=this.settings.flow||t.flow||"auto",r=t.viewport||"",o=this.settings.minSpreadWidth||t.minSpreadWidth||800,a=this.settings.direction||t.direction||"ltr";return(0===this.settings.width||this.settings.width>0)&&(0===this.settings.height||this.settings.height),{layout:e,spread:i,orientation:n,flow:s,viewport:r,minSpreadWidth:o,direction:a}}flow(t){var e=t;"scrolled"!==t&&"scrolled-doc"!==t&&"scrolled-continuous"!==t||(e="scrolled"),"auto"!==t&&"paginated"!==t||(e="paginated"),this.settings.flow=t,this._layout&&this._layout.flow(e),this.manager&&this._layout&&this.manager.applyLayout(this._layout),this.manager&&this.manager.updateFlow(e),this.manager&&this.manager.isRendered()&&this.location&&(this.manager.clear(),this.display(this.location.start.cfi))}layout(t){return t&&(this._layout=new u(t),this._layout.spread(t.spread,this.settings.minSpreadWidth),this._layout.on(l.c.LAYOUT.UPDATED,(t,e)=>{this.emit(l.c.RENDITION.LAYOUT,t,e)})),this.manager&&this._layout&&this.manager.applyLayout(this._layout),this._layout}spread(t,e){this.settings.spread=t,e&&(this.settings.minSpreadWidth=e),this._layout&&this._layout.spread(t,e),this.manager&&this.manager.isRendered()&&this.manager.updateLayout()}direction(t){this.settings.direction=t||"ltr",this.manager&&this.manager.direction(this.settings.direction),this.manager&&this.manager.isRendered()&&this.location&&(this.manager.clear(),this.display(this.location.start.cfi))}reportLocation(){return this.q.enqueue(function(){requestAnimationFrame(function(){var t=this.manager.currentLocation();if(t&&t.then&&"function"==typeof t.then)t.then(function(t){let e=this.located(t);e&&e.start&&e.end&&(this.location=e,this.emit(l.c.RENDITION.LOCATION_CHANGED,{index:this.location.start.index,href:this.location.start.href,start:this.location.start.cfi,end:this.location.end.cfi,percentage:this.location.start.percentage}),this.emit(l.c.RENDITION.RELOCATED,this.location))}.bind(this));else if(t){let e=this.located(t);if(!e||!e.start||!e.end)return;this.location=e,this.emit(l.c.RENDITION.LOCATION_CHANGED,{index:this.location.start.index,href:this.location.start.href,start:this.location.start.cfi,end:this.location.end.cfi,percentage:this.location.start.percentage}),this.emit(l.c.RENDITION.RELOCATED,this.location)}}.bind(this))}.bind(this))}currentLocation(){var t=this.manager.currentLocation();if(t&&t.then&&"function"==typeof t.then)t.then(function(t){return this.located(t)}.bind(this));else if(t){return this.located(t)}}located(t){if(!t.length)return{};let e=t[0],i=t[t.length-1],n={start:{index:e.index,href:e.href,cfi:e.mapping.start,displayed:{page:e.pages[0]||1,total:e.totalPages}},end:{index:i.index,href:i.href,cfi:i.mapping.end,displayed:{page:i.pages[i.pages.length-1]||1,total:i.totalPages}}},s=this.book.locations.locationFromCfi(e.mapping.start),r=this.book.locations.locationFromCfi(i.mapping.end);null!=s&&(n.start.location=s,n.start.percentage=this.book.locations.percentageFromLocation(s)),null!=r&&(n.end.location=r,n.end.percentage=this.book.locations.percentageFromLocation(r));let o=this.book.pageList.pageFromCfi(e.mapping.start),a=this.book.pageList.pageFromCfi(i.mapping.end);return-1!=o&&(n.start.page=o),-1!=a&&(n.end.page=a),i.index===this.book.spine.last().index&&n.end.displayed.page>=n.end.displayed.total&&(n.atEnd=!0),e.index===this.book.spine.first().index&&1===n.start.displayed.page&&(n.atStart=!0),n}destroy(){this.manager&&this.manager.destroy(),this.book=void 0}passEvents(t){l.a.forEach(e=>{t.on(e,e=>this.triggerViewEvent(e,t))}),t.on(l.c.CONTENTS.SELECTED,e=>this.triggerSelectedEvent(e,t))}triggerViewEvent(t,e){this.emit(t.type,t,e)}triggerSelectedEvent(t,e){this.emit(l.c.RENDITION.SELECTED,t,e)}triggerMarkEvent(t,e,i){this.emit(l.c.RENDITION.MARK_CLICKED,t,e,i)}getRange(t,e){var i=new a.a(t),n=this.manager.visible().filter((function(t){if(i.spinePos===t.index)return!0}));if(n.length)return n[0].contents.range(i,e)}adjustImages(t){if("pre-paginated"===this._layout.name)return new Promise((function(t){t()}));let e=t.window.getComputedStyle(t.content,null),i=.95*(t.content.offsetHeight-(parseFloat(e.paddingTop)+parseFloat(e.paddingBottom))),n=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight);return t.addStylesheetRules({img:{"max-width":(this._layout.columnWidth?this._layout.columnWidth-n+"px":"100%")+"!important","max-height":i+"px!important","object-fit":"contain","page-break-inside":"avoid","break-inside":"avoid","box-sizing":"border-box"},svg:{"max-width":(this._layout.columnWidth?this._layout.columnWidth-n+"px":"100%")+"!important","max-height":i+"px!important","page-break-inside":"avoid","break-inside":"avoid"}}),new Promise((function(t,e){setTimeout((function(){t()}),1)}))}getContents(){return this.manager?this.manager.getContents():[]}views(){return(this.manager?this.manager.views:void 0)||[]}handleLinks(t){t&&t.on(l.c.CONTENTS.LINK_CLICKED,t=>{let e=this.book.path.relative(t);this.display(e)})}injectStylesheet(t,e){let i=t.createElement("link");i.setAttribute("type","text/css"),i.setAttribute("rel","stylesheet"),i.setAttribute("href",this.settings.stylesheet),t.getElementsByTagName("head")[0].appendChild(i)}injectScript(t,e){let i=t.createElement("script");i.setAttribute("type","text/javascript"),i.setAttribute("src",this.settings.script),i.textContent=" ",t.getElementsByTagName("head")[0].appendChild(i)}injectIdentifier(t,e){let i=this.book.packaging.metadata.identifier,n=t.createElement("meta");n.setAttribute("name","dc.relation.ispartof"),i&&n.setAttribute("content",i),t.getElementsByTagName("head")[0].appendChild(n)}}s()(b.prototype);e.a=b},function(t,e){var i;i=function(){return this}();try{i=i||new Function("return this")()}catch(t){"object"==typeof window&&(i=window)}t.exports=i},function(t,e,i){"use strict";var n=i(38)();t.exports=function(t){return t!==n&&null!==t}},function(t,e){t.exports=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}},function(t,e,i){"use strict";var n=i(3),s=i.n(n),r=i(0),o=i(2),a=i(12),h=i(1),l=i(13);class c{constructor(t,e){this.settings=Object(r.extend)({ignoreClass:"",axis:void 0,direction:void 0,width:0,height:0,layout:void 0,globalLayoutProperties:{},method:void 0,forceRight:!1,allowScriptedContent:!1,allowPopups:!1},e||{}),this.id="epubjs-view-"+Object(r.uuid)(),this.section=t,this.index=t.index,this.element=this.container(this.settings.axis),this.added=!1,this.displayed=!1,this.rendered=!1,this.fixedWidth=0,this.fixedHeight=0,this.epubcfi=new o.a,this.layout=this.settings.layout,this.pane=void 0,this.highlights={},this.underlines={},this.marks={}}container(t){var e=document.createElement("div");return e.classList.add("epub-view"),e.style.height="0px",e.style.width="0px",e.style.overflow="hidden",e.style.position="relative",e.style.display="block",e.style.flex=t&&"horizontal"==t?"none":"initial",e}create(){return this.iframe||(this.element||(this.element=this.createContainer()),this.iframe=document.createElement("iframe"),this.iframe.id=this.id,this.iframe.scrolling="no",this.iframe.style.overflow="hidden",this.iframe.seamless="seamless",this.iframe.style.border="none",this.iframe.sandbox="allow-same-origin",this.settings.allowScriptedContent&&(this.iframe.sandbox+=" allow-scripts"),this.settings.allowPopups&&(this.iframe.sandbox+=" allow-popups"),this.iframe.setAttribute("enable-annotation","true"),this.resizing=!0,this.element.style.visibility="hidden",this.iframe.style.visibility="hidden",this.iframe.style.width="0",this.iframe.style.height="0",this._width=0,this._height=0,this.element.setAttribute("ref",this.index),this.added=!0,this.elementBounds=Object(r.bounds)(this.element),"srcdoc"in this.iframe?this.supportsSrcdoc=!0:this.supportsSrcdoc=!1,this.settings.method||(this.settings.method=this.supportsSrcdoc?"srcdoc":"write")),this.iframe}render(t,e){return this.create(),this.size(),this.sectionRender||(this.sectionRender=this.section.render(t)),this.sectionRender.then(function(t){return this.load(t)}.bind(this)).then(function(){let t,e=this.contents.writingMode();return t="scrolled"===this.settings.flow?0===e.indexOf("vertical")?"horizontal":"vertical":0===e.indexOf("vertical")?"vertical":"horizontal",0===e.indexOf("vertical")&&"paginated"===this.settings.flow&&(this.layout.delta=this.layout.height),this.setAxis(t),this.emit(h.c.VIEWS.AXIS,t),this.setWritingMode(e),this.emit(h.c.VIEWS.WRITING_MODE,e),this.layout.format(this.contents,this.section,this.axis),this.addListeners(),new Promise((t,e)=>{this.expand(),this.settings.forceRight&&(this.element.style.marginLeft=this.width()+"px"),t()})}.bind(this),function(t){return this.emit(h.c.VIEWS.LOAD_ERROR,t),new Promise((e,i)=>{i(t)})}.bind(this)).then(function(){this.emit(h.c.VIEWS.RENDERED,this.section)}.bind(this))}reset(){this.iframe&&(this.iframe.style.width="0",this.iframe.style.height="0",this._width=0,this._height=0,this._textWidth=void 0,this._contentWidth=void 0,this._textHeight=void 0,this._contentHeight=void 0),this._needsReframe=!0}size(t,e){var i=t||this.settings.width,n=e||this.settings.height;"pre-paginated"===this.layout.name?this.lock("both",i,n):"horizontal"===this.settings.axis?this.lock("height",i,n):this.lock("width",i,n),this.settings.width=i,this.settings.height=n}lock(t,e,i){var n,s=Object(r.borders)(this.element);n=this.iframe?Object(r.borders)(this.iframe):{width:0,height:0},"width"==t&&Object(r.isNumber)(e)&&(this.lockedWidth=e-s.width-n.width),"height"==t&&Object(r.isNumber)(i)&&(this.lockedHeight=i-s.height-n.height),"both"===t&&Object(r.isNumber)(e)&&Object(r.isNumber)(i)&&(this.lockedWidth=e-s.width-n.width,this.lockedHeight=i-s.height-n.height),this.displayed&&this.iframe&&this.expand()}expand(t){var e,i=this.lockedWidth,n=this.lockedHeight;this.iframe&&!this._expanding&&(this._expanding=!0,"pre-paginated"===this.layout.name?(i=this.layout.columnWidth,n=this.layout.height):"horizontal"===this.settings.axis?((i=this.contents.textWidth())%this.layout.pageWidth>0&&(i=Math.ceil(i/this.layout.pageWidth)*this.layout.pageWidth),this.settings.forceEvenPages&&(e=i/this.layout.pageWidth,this.layout.divisor>1&&"reflowable"===this.layout.name&&e%2>0&&(i+=this.layout.pageWidth))):"vertical"===this.settings.axis&&(n=this.contents.textHeight(),"paginated"===this.settings.flow&&n%this.layout.height>0&&(n=Math.ceil(n/this.layout.height)*this.layout.height)),(this._needsReframe||i!=this._width||n!=this._height)&&this.reframe(i,n),this._expanding=!1)}reframe(t,e){var i;Object(r.isNumber)(t)&&(this.element.style.width=t+"px",this.iframe.style.width=t+"px",this._width=t),Object(r.isNumber)(e)&&(this.element.style.height=e+"px",this.iframe.style.height=e+"px",this._height=e),i={width:t,height:e,widthDelta:this.prevBounds?t-this.prevBounds.width:t,heightDelta:this.prevBounds?e-this.prevBounds.height:e},this.pane&&this.pane.render(),requestAnimationFrame(()=>{let t;for(let e in this.marks)this.marks.hasOwnProperty(e)&&(t=this.marks[e],this.placeMark(t.element,t.range))}),this.onResize(this,i),this.emit(h.c.VIEWS.RESIZED,i),this.prevBounds=i,this.elementBounds=Object(r.bounds)(this.element)}load(t){var e=new r.defer,i=e.promise;if(!this.iframe)return e.reject(new Error("No Iframe Available")),i;if(this.iframe.onload=function(t){this.onLoad(t,e)}.bind(this),"blobUrl"===this.settings.method)this.blobUrl=Object(r.createBlobUrl)(t,"application/xhtml+xml"),this.iframe.src=this.blobUrl,this.element.appendChild(this.iframe);else if("srcdoc"===this.settings.method)this.iframe.srcdoc=t,this.element.appendChild(this.iframe);else{if(this.element.appendChild(this.iframe),this.document=this.iframe.contentDocument,!this.document)return e.reject(new Error("No Document Available")),i;if(this.iframe.contentDocument.open(),window.MSApp&&MSApp.execUnsafeLocalFunction){var n=this;MSApp.execUnsafeLocalFunction((function(){n.iframe.contentDocument.write(t)}))}else this.iframe.contentDocument.write(t);this.iframe.contentDocument.close()}return i}onLoad(t,e){this.window=this.iframe.contentWindow,this.document=this.iframe.contentDocument,this.contents=new a.a(this.document,this.document.body,this.section.cfiBase,this.section.index),this.rendering=!1;var i=this.document.querySelector("link[rel='canonical']");i?i.setAttribute("href",this.section.canonical):((i=this.document.createElement("link")).setAttribute("rel","canonical"),i.setAttribute("href",this.section.canonical),this.document.querySelector("head").appendChild(i)),this.contents.on(h.c.CONTENTS.EXPAND,()=>{this.displayed&&this.iframe&&(this.expand(),this.contents&&this.layout.format(this.contents))}),this.contents.on(h.c.CONTENTS.RESIZE,t=>{this.displayed&&this.iframe&&(this.expand(),this.contents&&this.layout.format(this.contents))}),e.resolve(this.contents)}setLayout(t){this.layout=t,this.contents&&(this.layout.format(this.contents),this.expand())}setAxis(t){this.settings.axis=t,this.element.style.flex="horizontal"==t?"none":"initial",this.size()}setWritingMode(t){this.writingMode=t}addListeners(){}removeListeners(t){}display(t){var e=new r.defer;return this.displayed?e.resolve(this):this.render(t).then(function(){this.emit(h.c.VIEWS.DISPLAYED,this),this.onDisplayed(this),this.displayed=!0,e.resolve(this)}.bind(this),(function(t){e.reject(t,this)})),e.promise}show(){this.element.style.visibility="visible",this.iframe&&(this.iframe.style.visibility="visible",this.iframe.style.transform="translateZ(0)",this.iframe.offsetWidth,this.iframe.style.transform=null),this.emit(h.c.VIEWS.SHOWN,this)}hide(){this.element.style.visibility="hidden",this.iframe.style.visibility="hidden",this.stopExpanding=!0,this.emit(h.c.VIEWS.HIDDEN,this)}offset(){return{top:this.element.offsetTop,left:this.element.offsetLeft}}width(){return this._width}height(){return this._height}position(){return this.element.getBoundingClientRect()}locationOf(t){this.iframe.getBoundingClientRect();var e=this.contents.locationOf(t,this.settings.ignoreClass);return{left:e.left,top:e.top}}onDisplayed(t){}onResize(t,e){}bounds(t){return!t&&this.elementBounds||(this.elementBounds=Object(r.bounds)(this.element)),this.elementBounds}highlight(t,e={},i,n="epubjs-hl",s={}){if(!this.contents)return;const r=Object.assign({fill:"yellow","fill-opacity":"0.3","mix-blend-mode":"multiply"},s);let o=this.contents.range(t),a=()=>{this.emit(h.c.VIEWS.MARK_CLICKED,t,e)};e.epubcfi=t,this.pane||(this.pane=new l.Pane(this.iframe,this.element));let c=new l.Highlight(o,n,e,r),u=this.pane.addMark(c);return this.highlights[t]={mark:u,element:u.element,listeners:[a,i]},u.element.setAttribute("ref",n),u.element.addEventListener("click",a),u.element.addEventListener("touchstart",a),i&&(u.element.addEventListener("click",i),u.element.addEventListener("touchstart",i)),u}underline(t,e={},i,n="epubjs-ul",s={}){if(!this.contents)return;const r=Object.assign({stroke:"black","stroke-opacity":"0.3","mix-blend-mode":"multiply"},s);let o=this.contents.range(t),a=()=>{this.emit(h.c.VIEWS.MARK_CLICKED,t,e)};e.epubcfi=t,this.pane||(this.pane=new l.Pane(this.iframe,this.element));let c=new l.Underline(o,n,e,r),u=this.pane.addMark(c);return this.underlines[t]={mark:u,element:u.element,listeners:[a,i]},u.element.setAttribute("ref",n),u.element.addEventListener("click",a),u.element.addEventListener("touchstart",a),i&&(u.element.addEventListener("click",i),u.element.addEventListener("touchstart",i)),u}mark(t,e={},i){if(!this.contents)return;if(t in this.marks){return this.marks[t]}let n=this.contents.range(t);if(!n)return;let s=n.commonAncestorContainer,r=1===s.nodeType?s:s.parentNode,o=i=>{this.emit(h.c.VIEWS.MARK_CLICKED,t,e)};n.collapsed&&1===s.nodeType?(n=new Range,n.selectNodeContents(s)):n.collapsed&&(n=new Range,n.selectNodeContents(r));let a=this.document.createElement("a");return a.setAttribute("ref","epubjs-mk"),a.style.position="absolute",a.dataset.epubcfi=t,e&&Object.keys(e).forEach(t=>{a.dataset[t]=e[t]}),i&&(a.addEventListener("click",i),a.addEventListener("touchstart",i)),a.addEventListener("click",o),a.addEventListener("touchstart",o),this.placeMark(a,n),this.element.appendChild(a),this.marks[t]={element:a,range:n,listeners:[o,i]},r}placeMark(t,e){let i,n,s;if("pre-paginated"===this.layout.name||"horizontal"!==this.settings.axis){let t=e.getBoundingClientRect();i=t.top,n=t.right}else{let t,o=e.getClientRects();for(var r=0;r!=o.length;r++)t=o[r],(!s||t.left<s)&&(s=t.left,n=Math.ceil(s/this.layout.props.pageWidth)*this.layout.props.pageWidth-this.layout.gap/2,i=t.top)}t.style.top=i+"px",t.style.left=n+"px"}unhighlight(t){let e;t in this.highlights&&(e=this.highlights[t],this.pane.removeMark(e.mark),e.listeners.forEach(t=>{t&&(e.element.removeEventListener("click",t),e.element.removeEventListener("touchstart",t))}),delete this.highlights[t])}ununderline(t){let e;t in this.underlines&&(e=this.underlines[t],this.pane.removeMark(e.mark),e.listeners.forEach(t=>{t&&(e.element.removeEventListener("click",t),e.element.removeEventListener("touchstart",t))}),delete this.underlines[t])}unmark(t){let e;t in this.marks&&(e=this.marks[t],this.element.removeChild(e.element),e.listeners.forEach(t=>{t&&(e.element.removeEventListener("click",t),e.element.removeEventListener("touchstart",t))}),delete this.marks[t])}destroy(){for(let t in this.highlights)this.unhighlight(t);for(let t in this.underlines)this.ununderline(t);for(let t in this.marks)this.unmark(t);this.blobUrl&&Object(r.revokeBlobUrl)(this.blobUrl),this.displayed&&(this.displayed=!1,this.removeListeners(),this.contents.destroy(),this.stopExpanding=!0,this.element.removeChild(this.iframe),this.pane&&(this.pane.element.remove(),this.pane=void 0),this.iframe=void 0,this.contents=void 0,this._textWidth=null,this._textHeight=null,this._width=null,this._height=null)}}s()(c.prototype),e.a=c},function(t,e,i){var n=i(19),s=i(51),r=i(53),o=Math.max,a=Math.min;t.exports=function(t,e,i){var h,l,c,u,d,f,p=0,g=!1,m=!1,v=!0;if("function"!=typeof t)throw new TypeError("Expected a function");function y(e){var i=h,n=l;return h=l=void 0,p=e,u=t.apply(n,i)}function b(t){return p=t,d=setTimeout(x,e),g?y(t):u}function w(t){var i=t-f;return void 0===f||i>=e||i<0||m&&t-p>=c}function x(){var t=s();if(w(t))return E(t);d=setTimeout(x,function(t){var i=e-(t-f);return m?a(i,c-(t-p)):i}(t))}function E(t){return d=void 0,v&&h?y(t):(h=l=void 0,u)}function S(){var t=s(),i=w(t);if(h=arguments,l=this,f=t,i){if(void 0===d)return b(f);if(m)return clearTimeout(d),d=setTimeout(x,e),y(f)}return void 0===d&&(d=setTimeout(x,e)),u}return e=r(e)||0,n(i)&&(g=!!i.leading,c=(m="maxWait"in i)?o(r(i.maxWait)||0,e):c,v="trailing"in i?!!i.trailing:v),S.cancel=function(){void 0!==d&&clearTimeout(d),p=0,h=f=l=d=void 0},S.flush=function(){return void 0===d?u:E(s())},S}},function(t,e,i){"use strict";var n=i(0),s=i(10),r=i(1),o=i(3),a=i.n(o);const h=Math.PI/2,l={easeOutSine:function(t){return Math.sin(t*h)},easeInOutSine:function(t){return-.5*(Math.cos(Math.PI*t)-1)},easeInOutQuint:function(t){return(t/=.5)<1?.5*Math.pow(t,5):.5*(Math.pow(t-2,5)+2)},easeInCubic:function(t){return Math.pow(t,3)}};class c{constructor(t,e){this.settings=Object(n.extend)({duration:80,minVelocity:.2,minDistance:10,easing:l.easeInCubic},e||{}),this.supportsTouch=this.supportsTouch(),this.supportsTouch&&this.setup(t)}setup(t){this.manager=t,this.layout=this.manager.layout,this.fullsize=this.manager.settings.fullsize,this.fullsize?(this.element=this.manager.stage.element,this.scroller=window,this.disableScroll()):(this.element=this.manager.stage.container,this.scroller=this.element,this.element.style.WebkitOverflowScrolling="touch"),this.manager.settings.offset=this.layout.width,this.manager.settings.afterScrolledTimeout=2*this.settings.duration,this.isVertical="vertical"===this.manager.settings.axis,this.manager.isPaginated&&!this.isVertical&&(this.touchCanceler=!1,this.resizeCanceler=!1,this.snapping=!1,this.scrollLeft,this.scrollTop,this.startTouchX=void 0,this.startTouchY=void 0,this.startTime=void 0,this.endTouchX=void 0,this.endTouchY=void 0,this.endTime=void 0,this.addListeners())}supportsTouch(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}disableScroll(){this.element.style.overflow="hidden"}enableScroll(){this.element.style.overflow=""}addListeners(){this._onResize=this.onResize.bind(this),window.addEventListener("resize",this._onResize),this._onScroll=this.onScroll.bind(this),this.scroller.addEventListener("scroll",this._onScroll),this._onTouchStart=this.onTouchStart.bind(this),this.scroller.addEventListener("touchstart",this._onTouchStart,{passive:!0}),this.on("touchstart",this._onTouchStart),this._onTouchMove=this.onTouchMove.bind(this),this.scroller.addEventListener("touchmove",this._onTouchMove,{passive:!0}),this.on("touchmove",this._onTouchMove),this._onTouchEnd=this.onTouchEnd.bind(this),this.scroller.addEventListener("touchend",this._onTouchEnd,{passive:!0}),this.on("touchend",this._onTouchEnd),this._afterDisplayed=this.afterDisplayed.bind(this),this.manager.on(r.c.MANAGERS.ADDED,this._afterDisplayed)}removeListeners(){window.removeEventListener("resize",this._onResize),this._onResize=void 0,this.scroller.removeEventListener("scroll",this._onScroll),this._onScroll=void 0,this.scroller.removeEventListener("touchstart",this._onTouchStart,{passive:!0}),this.off("touchstart",this._onTouchStart),this._onTouchStart=void 0,this.scroller.removeEventListener("touchmove",this._onTouchMove,{passive:!0}),this.off("touchmove",this._onTouchMove),this._onTouchMove=void 0,this.scroller.removeEventListener("touchend",this._onTouchEnd,{passive:!0}),this.off("touchend",this._onTouchEnd),this._onTouchEnd=void 0,this.manager.off(r.c.MANAGERS.ADDED,this._afterDisplayed),this._afterDisplayed=void 0}afterDisplayed(t){let e=t.contents;["touchstart","touchmove","touchend"].forEach(t=>{e.on(t,t=>this.triggerViewEvent(t,e))})}triggerViewEvent(t,e){this.emit(t.type,t,e)}onScroll(t){this.scrollLeft=this.fullsize?window.scrollX:this.scroller.scrollLeft,this.scrollTop=this.fullsize?window.scrollY:this.scroller.scrollTop}onResize(t){this.resizeCanceler=!0}onTouchStart(t){let{screenX:e,screenY:i}=t.touches[0];this.fullsize&&this.enableScroll(),this.touchCanceler=!0,this.startTouchX||(this.startTouchX=e,this.startTouchY=i,this.startTime=this.now()),this.endTouchX=e,this.endTouchY=i,this.endTime=this.now()}onTouchMove(t){let{screenX:e,screenY:i}=t.touches[0],n=Math.abs(i-this.endTouchY);this.touchCanceler=!0,!this.fullsize&&n<10&&(this.element.scrollLeft-=e-this.endTouchX),this.endTouchX=e,this.endTouchY=i,this.endTime=this.now()}onTouchEnd(t){this.fullsize&&this.disableScroll(),this.touchCanceler=!1;let e=this.wasSwiped();0!==e?this.snap(e):this.snap(),this.startTouchX=void 0,this.startTouchY=void 0,this.startTime=void 0,this.endTouchX=void 0,this.endTouchY=void 0,this.endTime=void 0}wasSwiped(){let t=this.layout.pageWidth*this.layout.divisor,e=this.endTouchX-this.startTouchX,i=Math.abs(e),n=e/(this.endTime-this.startTime),s=this.settings.minVelocity;return i<=this.settings.minDistance||i>=t?0:n>s?-1:n<-s?1:void 0}needsSnap(){return this.scrollLeft%(this.layout.pageWidth*this.layout.divisor)!=0}snap(t=0){let e=this.scrollLeft,i=this.layout.pageWidth*this.layout.divisor,n=Math.round(e/i)*i;return t&&(n+=t*i),this.smoothScrollTo(n)}smoothScrollTo(t){const e=new n.defer,i=this.scrollLeft,s=this.now(),r=this.settings.duration,o=this.settings.easing;return this.snapping=!0,function n(){const a=this.now(),h=Math.min(1,(a-s)/r);if(o(h),this.touchCanceler||this.resizeCanceler)return this.resizeCanceler=!1,this.snapping=!1,void e.resolve();h<1?(window.requestAnimationFrame(n.bind(this)),this.scrollTo(i+(t-i)*h,0)):(this.scrollTo(t,0),this.snapping=!1,e.resolve())}.call(this),e.promise}scrollTo(t=0,e=0){this.fullsize?window.scroll(t,e):(this.scroller.scrollLeft=t,this.scroller.scrollTop=e)}now(){return"now"in window.performance?performance.now():(new Date).getTime()}destroy(){this.scroller&&(this.fullsize&&this.enableScroll(),this.removeListeners(),this.scroller=void 0)}}a()(c.prototype);var u=c,d=i(21),f=i.n(d);class p extends s.a{constructor(t){super(t),this.name="continuous",this.settings=Object(n.extend)(this.settings||{},{infinite:!0,overflow:void 0,axis:void 0,writingMode:void 0,flow:"scrolled",offset:500,offsetDelta:250,width:void 0,height:void 0,snap:!1,afterScrolledTimeout:10,allowScriptedContent:!1,allowPopups:!1}),Object(n.extend)(this.settings,t.settings||{}),"undefined"!=t.settings.gap&&0===t.settings.gap&&(this.settings.gap=t.settings.gap),this.viewSettings={ignoreClass:this.settings.ignoreClass,axis:this.settings.axis,flow:this.settings.flow,layout:this.layout,width:0,height:0,forceEvenPages:!1,allowScriptedContent:this.settings.allowScriptedContent,allowPopups:this.settings.allowPopups},this.scrollTop=0,this.scrollLeft=0}display(t,e){return s.a.prototype.display.call(this,t,e).then(function(){return this.fill()}.bind(this))}fill(t){var e=t||new n.defer;return this.q.enqueue(()=>this.check()).then(t=>{t?this.fill(e):e.resolve()}),e.promise}moveTo(t){var e=0,i=0;this.isPaginated?(e=Math.floor(t.left/this.layout.delta)*this.layout.delta,this.settings.offsetDelta):(i=t.top,t.top,this.settings.offsetDelta),(e>0||i>0)&&this.scrollBy(e,i,!0)}afterResized(t){this.emit(r.c.MANAGERS.RESIZE,t.section)}removeShownListeners(t){t.onDisplayed=function(){}}add(t){var e=this.createView(t);return this.views.append(e),e.on(r.c.VIEWS.RESIZED,t=>{e.expanded=!0}),e.on(r.c.VIEWS.AXIS,t=>{this.updateAxis(t)}),e.on(r.c.VIEWS.WRITING_MODE,t=>{this.updateWritingMode(t)}),e.onDisplayed=this.afterDisplayed.bind(this),e.onResize=this.afterResized.bind(this),e.display(this.request)}append(t){var e=this.createView(t);return e.on(r.c.VIEWS.RESIZED,t=>{e.expanded=!0}),e.on(r.c.VIEWS.AXIS,t=>{this.updateAxis(t)}),e.on(r.c.VIEWS.WRITING_MODE,t=>{this.updateWritingMode(t)}),this.views.append(e),e.onDisplayed=this.afterDisplayed.bind(this),e}prepend(t){var e=this.createView(t);return e.on(r.c.VIEWS.RESIZED,t=>{this.counter(t),e.expanded=!0}),e.on(r.c.VIEWS.AXIS,t=>{this.updateAxis(t)}),e.on(r.c.VIEWS.WRITING_MODE,t=>{this.updateWritingMode(t)}),this.views.prepend(e),e.onDisplayed=this.afterDisplayed.bind(this),e}counter(t){"vertical"===this.settings.axis?this.scrollBy(0,t.heightDelta,!0):this.scrollBy(t.widthDelta,0,!0)}update(t){for(var e,i=this.bounds(),s=this.views.all(),r=s.length,o=[],a=void 0!==t?t:this.settings.offset||0,h=new n.defer,l=[],c=0;c<r;c++)if(e=s[c],!0===this.isVisible(e,a,a,i)){if(e.displayed)e.show();else{let t=e.display(this.request).then((function(t){t.show()}),t=>{e.hide()});l.push(t)}o.push(e)}else this.q.enqueue(e.destroy.bind(e)),clearTimeout(this.trimTimeout),this.trimTimeout=setTimeout(function(){this.q.enqueue(this.trim.bind(this))}.bind(this),250);return l.length?Promise.all(l).catch(t=>{h.reject(t)}):(h.resolve(),h.promise)}check(t,e){var i=new n.defer,s=[],r="horizontal"===this.settings.axis,o=this.settings.offset||0;t&&r&&(o=t),e&&!r&&(o=e);var a=this._bounds;let h=r?this.scrollLeft:this.scrollTop,l=r?Math.floor(a.width):a.height,c=r?this.container.scrollWidth:this.container.scrollHeight,u=this.writingMode&&0===this.writingMode.indexOf("vertical")?"vertical":"horizontal",d=this.settings.rtlScrollType,f="rtl"===this.settings.direction;this.settings.fullsize?(r&&f&&"negative"===d||!r&&f&&"default"===d)&&(h*=-1):(f&&"default"===d&&"horizontal"===u&&(h=c-l-h),f&&"negative"===d&&"horizontal"===u&&(h*=-1));let p=()=>{let t=this.views.first(),e=t&&t.section.prev();e&&s.push(this.prepend(e))},g=h-o;h+l+o>=c&&(()=>{let t=this.views.last(),e=t&&t.section.next();e&&s.push(this.append(e))})(),g<0&&p();let m=s.map(t=>t.display(this.request));return s.length?Promise.all(m).then(()=>this.check()).then(()=>this.update(o),t=>t):(this.q.enqueue(function(){this.update()}.bind(this)),i.resolve(!1),i.promise)}trim(){for(var t=new n.defer,e=this.views.displayed(),i=e[0],s=e[e.length-1],r=this.views.indexOf(i),o=this.views.indexOf(s),a=this.views.slice(0,r),h=this.views.slice(o+1),l=0;l<a.length-1;l++)this.erase(a[l],a);for(var c=1;c<h.length;c++)this.erase(h[c]);return t.resolve(),t.promise}erase(t,e){var i,n;this.settings.fullsize?(i=window.scrollY,n=window.scrollX):(i=this.container.scrollTop,n=this.container.scrollLeft);var s=t.bounds();this.views.remove(t),e&&("vertical"===this.settings.axis?this.scrollTo(0,i-s.height,!0):"rtl"===this.settings.direction?this.settings.fullsize?this.scrollTo(n+Math.floor(s.width),0,!0):this.scrollTo(n,0,!0):this.scrollTo(n-Math.floor(s.width),0,!0))}addEventListeners(t){window.addEventListener("unload",function(t){this.ignore=!0,this.destroy()}.bind(this)),this.addScrollListeners(),this.isPaginated&&this.settings.snap&&(this.snapper=new u(this,this.settings.snap&&"object"==typeof this.settings.snap&&this.settings.snap))}addScrollListeners(){var t;this.tick=n.requestAnimationFrame;let e="rtl"===this.settings.direction&&"default"===this.settings.rtlScrollType?-1:1;this.scrollDeltaVert=0,this.scrollDeltaHorz=0,this.settings.fullsize?(t=window,this.scrollTop=window.scrollY*e,this.scrollLeft=window.scrollX*e):(t=this.container,this.scrollTop=this.container.scrollTop,this.scrollLeft=this.container.scrollLeft),this._onScroll=this.onScroll.bind(this),t.addEventListener("scroll",this._onScroll),this._scrolled=f()(this.scrolled.bind(this),30),this.didScroll=!1}removeEventListeners(){(this.settings.fullsize?window:this.container).removeEventListener("scroll",this._onScroll),this._onScroll=void 0}onScroll(){let t,e,i="rtl"===this.settings.direction&&"default"===this.settings.rtlScrollType?-1:1;this.settings.fullsize?(t=window.scrollY*i,e=window.scrollX*i):(t=this.container.scrollTop,e=this.container.scrollLeft),this.scrollTop=t,this.scrollLeft=e,this.ignore?this.ignore=!1:this._scrolled(),this.scrollDeltaVert+=Math.abs(t-this.prevScrollTop),this.scrollDeltaHorz+=Math.abs(e-this.prevScrollLeft),this.prevScrollTop=t,this.prevScrollLeft=e,clearTimeout(this.scrollTimeout),this.scrollTimeout=setTimeout(function(){this.scrollDeltaVert=0,this.scrollDeltaHorz=0}.bind(this),150),clearTimeout(this.afterScrolled),this.didScroll=!1}scrolled(){this.q.enqueue(function(){return this.check()}.bind(this)),this.emit(r.c.MANAGERS.SCROLL,{top:this.scrollTop,left:this.scrollLeft}),clearTimeout(this.afterScrolled),this.afterScrolled=setTimeout(function(){this.snapper&&this.snapper.supportsTouch&&this.snapper.needsSnap()||this.emit(r.c.MANAGERS.SCROLLED,{top:this.scrollTop,left:this.scrollLeft})}.bind(this),this.settings.afterScrolledTimeout)}next(){let t="pre-paginated"===this.layout.props.name&&this.layout.props.spread?2*this.layout.props.delta:this.layout.props.delta;this.views.length&&(this.isPaginated&&"horizontal"===this.settings.axis?this.scrollBy(t,0,!0):this.scrollBy(0,this.layout.height,!0),this.q.enqueue(function(){return this.check()}.bind(this)))}prev(){let t="pre-paginated"===this.layout.props.name&&this.layout.props.spread?2*this.layout.props.delta:this.layout.props.delta;this.views.length&&(this.isPaginated&&"horizontal"===this.settings.axis?this.scrollBy(-t,0,!0):this.scrollBy(0,-this.layout.height,!0),this.q.enqueue(function(){return this.check()}.bind(this)))}updateFlow(t){this.rendered&&this.snapper&&(this.snapper.destroy(),this.snapper=void 0),super.updateFlow(t,"scroll"),this.rendered&&this.isPaginated&&this.settings.snap&&(this.snapper=new u(this,this.settings.snap&&"object"==typeof this.settings.snap&&this.settings.snap))}destroy(){super.destroy(),this.snapper&&this.snapper.destroy()}}e.a=p},function(t,e,i){(function(e){t.exports=function t(e,i,n){function s(o,a){if(!i[o]){if(!e[o]){if(r)return r(o,!0);var h=new Error("Cannot find module '"+o+"'");throw h.code="MODULE_NOT_FOUND",h}var l=i[o]={exports:{}};e[o][0].call(l.exports,(function(t){var i=e[o][1][t];return s(i||t)}),l,l.exports,t,e,i,n)}return i[o].exports}for(var r=!1,o=0;o<n.length;o++)s(n[o]);return s}({1:[function(t,i,n){(function(t){"use strict";var e,n,s=t.MutationObserver||t.WebKitMutationObserver;if(s){var r=0,o=new s(c),a=t.document.createTextNode("");o.observe(a,{characterData:!0}),e=function(){a.data=r=++r%2}}else if(t.setImmediate||void 0===t.MessageChannel)e="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){c(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(c,0)};else{var h=new t.MessageChannel;h.port1.onmessage=c,e=function(){h.port2.postMessage(0)}}var l=[];function c(){var t,e;n=!0;for(var i=l.length;i;){for(e=l,l=[],t=-1;++t<i;)e[t]();i=l.length}n=!1}i.exports=function(t){1!==l.push(t)||n||e()}}).call(this,void 0!==e?e:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(t,e,i){"use strict";var n=t(1);function s(){}var r={},o=["REJECTED"],a=["FULFILLED"],h=["PENDING"];function l(t){if("function"!=typeof t)throw new TypeError("resolver must be a function");this.state=h,this.queue=[],this.outcome=void 0,t!==s&&f(this,t)}function c(t,e,i){this.promise=t,"function"==typeof e&&(this.onFulfilled=e,this.callFulfilled=this.otherCallFulfilled),"function"==typeof i&&(this.onRejected=i,this.callRejected=this.otherCallRejected)}function u(t,e,i){n((function(){var n;try{n=e(i)}catch(e){return r.reject(t,e)}n===t?r.reject(t,new TypeError("Cannot resolve promise with itself")):r.resolve(t,n)}))}function d(t){var e=t&&t.then;if(t&&("object"==typeof t||"function"==typeof t)&&"function"==typeof e)return function(){e.apply(t,arguments)}}function f(t,e){var i=!1;function n(e){i||(i=!0,r.reject(t,e))}function s(e){i||(i=!0,r.resolve(t,e))}var o=p((function(){e(s,n)}));"error"===o.status&&n(o.value)}function p(t,e){var i={};try{i.value=t(e),i.status="success"}catch(t){i.status="error",i.value=t}return i}e.exports=l,l.prototype.catch=function(t){return this.then(null,t)},l.prototype.then=function(t,e){if("function"!=typeof t&&this.state===a||"function"!=typeof e&&this.state===o)return this;var i=new this.constructor(s);return this.state!==h?u(i,this.state===a?t:e,this.outcome):this.queue.push(new c(i,t,e)),i},c.prototype.callFulfilled=function(t){r.resolve(this.promise,t)},c.prototype.otherCallFulfilled=function(t){u(this.promise,this.onFulfilled,t)},c.prototype.callRejected=function(t){r.reject(this.promise,t)},c.prototype.otherCallRejected=function(t){u(this.promise,this.onRejected,t)},r.resolve=function(t,e){var i=p(d,e);if("error"===i.status)return r.reject(t,i.value);var n=i.value;if(n)f(t,n);else{t.state=a,t.outcome=e;for(var s=-1,o=t.queue.length;++s<o;)t.queue[s].callFulfilled(e)}return t},r.reject=function(t,e){t.state=o,t.outcome=e;for(var i=-1,n=t.queue.length;++i<n;)t.queue[i].callRejected(e);return t},l.resolve=function(t){return t instanceof this?t:r.resolve(new this(s),t)},l.reject=function(t){var e=new this(s);return r.reject(e,t)},l.all=function(t){var e=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var i=t.length,n=!1;if(!i)return this.resolve([]);for(var o=new Array(i),a=0,h=-1,l=new this(s);++h<i;)c(t[h],h);return l;function c(t,s){e.resolve(t).then((function(t){o[s]=t,++a!==i||n||(n=!0,r.resolve(l,o))}),(function(t){n||(n=!0,r.reject(l,t))}))}},l.race=function(t){var e=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var i=t.length,n=!1;if(!i)return this.resolve([]);for(var o,a=-1,h=new this(s);++a<i;)o=t[a],e.resolve(o).then((function(t){n||(n=!0,r.resolve(h,t))}),(function(t){n||(n=!0,r.reject(h,t))}));return h}},{1:1}],3:[function(t,i,n){(function(e){"use strict";"function"!=typeof e.Promise&&(e.Promise=t(2))}).call(this,void 0!==e?e:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{2:2}],4:[function(t,e,i){"use strict";var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},s=function(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(t){return}}();function r(t,e){t=t||[],e=e||{};try{return new Blob(t,e)}catch(s){if("TypeError"!==s.name)throw s;for(var i=new("undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder),n=0;n<t.length;n+=1)i.append(t[n]);return i.getBlob(e.type)}}"undefined"==typeof Promise&&t(3);var o=Promise;function a(t,e){e&&t.then((function(t){e(null,t)}),(function(t){e(t)}))}function h(t,e,i){"function"==typeof e&&t.then(e),"function"==typeof i&&t.catch(i)}function l(t){return"string"!=typeof t&&(console.warn(t+" used as a key, but it is not a string."),t=String(t)),t}function c(){if(arguments.length&&"function"==typeof arguments[arguments.length-1])return arguments[arguments.length-1]}var u=void 0,d={},f=Object.prototype.toString;function p(t){return"boolean"==typeof u?o.resolve(u):function(t){return new o((function(e){var i=t.transaction("local-forage-detect-blob-support","readwrite"),n=r([""]);i.objectStore("local-forage-detect-blob-support").put(n,"key"),i.onabort=function(t){t.preventDefault(),t.stopPropagation(),e(!1)},i.oncomplete=function(){var t=navigator.userAgent.match(/Chrome\\/(\\d+)/),i=navigator.userAgent.match(/Edge\\//);e(i||!t||parseInt(t[1],10)>=43)}})).catch((function(){return!1}))}(t).then((function(t){return u=t}))}function g(t){var e=d[t.name],i={};i.promise=new o((function(t,e){i.resolve=t,i.reject=e})),e.deferredOperations.push(i),e.dbReady?e.dbReady=e.dbReady.then((function(){return i.promise})):e.dbReady=i.promise}function m(t){var e=d[t.name].deferredOperations.pop();if(e)return e.resolve(),e.promise}function v(t,e){var i=d[t.name].deferredOperations.pop();if(i)return i.reject(e),i.promise}function y(t,e){return new o((function(i,n){if(d[t.name]=d[t.name]||{forages:[],db:null,dbReady:null,deferredOperations:[]},t.db){if(!e)return i(t.db);g(t),t.db.close()}var r=[t.name];e&&r.push(t.version);var o=s.open.apply(s,r);e&&(o.onupgradeneeded=function(e){var i=o.result;try{i.createObjectStore(t.storeName),e.oldVersion<=1&&i.createObjectStore("local-forage-detect-blob-support")}catch(i){if("ConstraintError"!==i.name)throw i;console.warn('The database "'+t.name+'" has been upgraded from version '+e.oldVersion+" to version "+e.newVersion+', but the storage "'+t.storeName+'" already exists.')}}),o.onerror=function(t){t.preventDefault(),n(o.error)},o.onsuccess=function(){var e=o.result;e.onversionchange=function(t){t.target.close()},i(e),m(t)}}))}function b(t){return y(t,!1)}function w(t){return y(t,!0)}function x(t,e){if(!t.db)return!0;var i=!t.db.objectStoreNames.contains(t.storeName),n=t.version<t.db.version,s=t.version>t.db.version;if(n&&(t.version!==e&&console.warn('The database "'+t.name+"\\" can't be downgraded from version "+t.db.version+" to version "+t.version+"."),t.version=t.db.version),s||i){if(i){var r=t.db.version+1;r>t.version&&(t.version=r)}return!0}return!1}function E(t){return r([function(t){for(var e=t.length,i=new ArrayBuffer(e),n=new Uint8Array(i),s=0;s<e;s++)n[s]=t.charCodeAt(s);return i}(atob(t.data))],{type:t.type})}function S(t){return t&&t.__local_forage_encoded_blob}function N(t){var e=this,i=e._initReady().then((function(){var t=d[e._dbInfo.name];if(t&&t.dbReady)return t.dbReady}));return h(i,t,t),i}function _(t,e,i,n){void 0===n&&(n=1);try{var s=t.db.transaction(t.storeName,e);i(null,s)}catch(s){if(n>0&&(!t.db||"InvalidStateError"===s.name||"NotFoundError"===s.name))return o.resolve().then((function(){if(!t.db||"NotFoundError"===s.name&&!t.db.objectStoreNames.contains(t.storeName)&&t.version<=t.db.version)return t.db&&(t.version=t.db.version+1),w(t)})).then((function(){return function(t){g(t);for(var e=d[t.name],i=e.forages,n=0;n<i.length;n++){var s=i[n];s._dbInfo.db&&(s._dbInfo.db.close(),s._dbInfo.db=null)}return t.db=null,b(t).then((function(e){return t.db=e,x(t)?w(t):e})).then((function(n){t.db=e.db=n;for(var s=0;s<i.length;s++)i[s]._dbInfo.db=n})).catch((function(e){throw v(t,e),e}))}(t).then((function(){_(t,e,i,n-1)}))})).catch(i);i(s)}}var T={_driver:"asyncStorage",_initStorage:function(t){var e=this,i={db:null};if(t)for(var n in t)i[n]=t[n];var s=d[i.name];s||(s={forages:[],db:null,dbReady:null,deferredOperations:[]},d[i.name]=s),s.forages.push(e),e._initReady||(e._initReady=e.ready,e.ready=N);var r=[];function a(){return o.resolve()}for(var h=0;h<s.forages.length;h++){var l=s.forages[h];l!==e&&r.push(l._initReady().catch(a))}var c=s.forages.slice(0);return o.all(r).then((function(){return i.db=s.db,b(i)})).then((function(t){return i.db=t,x(i,e._defaultConfig.version)?w(i):t})).then((function(t){i.db=s.db=t,e._dbInfo=i;for(var n=0;n<c.length;n++){var r=c[n];r!==e&&(r._dbInfo.db=i.db,r._dbInfo.version=i.version)}}))},_support:function(){try{if(!s||!s.open)return!1;var t="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),e="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return(!t||e)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(t){return!1}}(),iterate:function(t,e){var i=this,n=new o((function(e,n){i.ready().then((function(){_(i._dbInfo,"readonly",(function(s,r){if(s)return n(s);try{var o=r.objectStore(i._dbInfo.storeName).openCursor(),a=1;o.onsuccess=function(){var i=o.result;if(i){var n=i.value;S(n)&&(n=E(n));var s=t(n,i.key,a++);void 0!==s?e(s):i.continue()}else e()},o.onerror=function(){n(o.error)}}catch(t){n(t)}}))})).catch(n)}));return a(n,e),n},getItem:function(t,e){var i=this;t=l(t);var n=new o((function(e,n){i.ready().then((function(){_(i._dbInfo,"readonly",(function(s,r){if(s)return n(s);try{var o=r.objectStore(i._dbInfo.storeName).get(t);o.onsuccess=function(){var t=o.result;void 0===t&&(t=null),S(t)&&(t=E(t)),e(t)},o.onerror=function(){n(o.error)}}catch(t){n(t)}}))})).catch(n)}));return a(n,e),n},setItem:function(t,e,i){var n=this;t=l(t);var s=new o((function(i,s){var r;n.ready().then((function(){return r=n._dbInfo,"[object Blob]"===f.call(e)?p(r.db).then((function(t){return t?e:(i=e,new o((function(t,e){var n=new FileReader;n.onerror=e,n.onloadend=function(e){var n=btoa(e.target.result||"");t({__local_forage_encoded_blob:!0,data:n,type:i.type})},n.readAsBinaryString(i)})));var i})):e})).then((function(e){_(n._dbInfo,"readwrite",(function(r,o){if(r)return s(r);try{var a=o.objectStore(n._dbInfo.storeName);null===e&&(e=void 0);var h=a.put(e,t);o.oncomplete=function(){void 0===e&&(e=null),i(e)},o.onabort=o.onerror=function(){var t=h.error?h.error:h.transaction.error;s(t)}}catch(t){s(t)}}))})).catch(s)}));return a(s,i),s},removeItem:function(t,e){var i=this;t=l(t);var n=new o((function(e,n){i.ready().then((function(){_(i._dbInfo,"readwrite",(function(s,r){if(s)return n(s);try{var o=r.objectStore(i._dbInfo.storeName).delete(t);r.oncomplete=function(){e()},r.onerror=function(){n(o.error)},r.onabort=function(){var t=o.error?o.error:o.transaction.error;n(t)}}catch(t){n(t)}}))})).catch(n)}));return a(n,e),n},clear:function(t){var e=this,i=new o((function(t,i){e.ready().then((function(){_(e._dbInfo,"readwrite",(function(n,s){if(n)return i(n);try{var r=s.objectStore(e._dbInfo.storeName).clear();s.oncomplete=function(){t()},s.onabort=s.onerror=function(){var t=r.error?r.error:r.transaction.error;i(t)}}catch(t){i(t)}}))})).catch(i)}));return a(i,t),i},length:function(t){var e=this,i=new o((function(t,i){e.ready().then((function(){_(e._dbInfo,"readonly",(function(n,s){if(n)return i(n);try{var r=s.objectStore(e._dbInfo.storeName).count();r.onsuccess=function(){t(r.result)},r.onerror=function(){i(r.error)}}catch(t){i(t)}}))})).catch(i)}));return a(i,t),i},key:function(t,e){var i=this,n=new o((function(e,n){t<0?e(null):i.ready().then((function(){_(i._dbInfo,"readonly",(function(s,r){if(s)return n(s);try{var o=r.objectStore(i._dbInfo.storeName),a=!1,h=o.openKeyCursor();h.onsuccess=function(){var i=h.result;i?0===t||a?e(i.key):(a=!0,i.advance(t)):e(null)},h.onerror=function(){n(h.error)}}catch(t){n(t)}}))})).catch(n)}));return a(n,e),n},keys:function(t){var e=this,i=new o((function(t,i){e.ready().then((function(){_(e._dbInfo,"readonly",(function(n,s){if(n)return i(n);try{var r=s.objectStore(e._dbInfo.storeName).openKeyCursor(),o=[];r.onsuccess=function(){var e=r.result;e?(o.push(e.key),e.continue()):t(o)},r.onerror=function(){i(r.error)}}catch(t){i(t)}}))})).catch(i)}));return a(i,t),i},dropInstance:function(t,e){e=c.apply(this,arguments);var i=this.config();(t="function"!=typeof t&&t||{}).name||(t.name=t.name||i.name,t.storeName=t.storeName||i.storeName);var n,r=this;if(t.name){var h=t.name===i.name&&r._dbInfo.db,l=h?o.resolve(r._dbInfo.db):b(t).then((function(e){var i=d[t.name],n=i.forages;i.db=e;for(var s=0;s<n.length;s++)n[s]._dbInfo.db=e;return e}));n=t.storeName?l.then((function(e){if(e.objectStoreNames.contains(t.storeName)){var i=e.version+1;g(t);var n=d[t.name],r=n.forages;e.close();for(var a=0;a<r.length;a++){var h=r[a];h._dbInfo.db=null,h._dbInfo.version=i}return new o((function(e,n){var r=s.open(t.name,i);r.onerror=function(t){r.result.close(),n(t)},r.onupgradeneeded=function(){r.result.deleteObjectStore(t.storeName)},r.onsuccess=function(){var t=r.result;t.close(),e(t)}})).then((function(t){n.db=t;for(var e=0;e<r.length;e++){var i=r[e];i._dbInfo.db=t,m(i._dbInfo)}})).catch((function(e){throw(v(t,e)||o.resolve()).catch((function(){})),e}))}})):l.then((function(e){g(t);var i=d[t.name],n=i.forages;e.close();for(var r=0;r<n.length;r++)n[r]._dbInfo.db=null;return new o((function(e,i){var n=s.deleteDatabase(t.name);n.onerror=function(){var t=n.result;t&&t.close(),i(n.error)},n.onblocked=function(){console.warn('dropInstance blocked for database "'+t.name+'" until all open connections are closed')},n.onsuccess=function(){var t=n.result;t&&t.close(),e(t)}})).then((function(t){i.db=t;for(var e=0;e<n.length;e++)m(n[e]._dbInfo)})).catch((function(e){throw(v(t,e)||o.resolve()).catch((function(){})),e}))}))}else n=o.reject("Invalid arguments");return a(n,e),n}},C="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",O=/^~~local_forage_type~([^~]+)~/,I="__lfsc__:".length,R=I+"arbf".length,k=Object.prototype.toString;function A(t){var e,i,n,s,r,o=.75*t.length,a=t.length,h=0;"="===t[t.length-1]&&(o--,"="===t[t.length-2]&&o--);var l=new ArrayBuffer(o),c=new Uint8Array(l);for(e=0;e<a;e+=4)i=C.indexOf(t[e]),n=C.indexOf(t[e+1]),s=C.indexOf(t[e+2]),r=C.indexOf(t[e+3]),c[h++]=i<<2|n>>4,c[h++]=(15&n)<<4|s>>2,c[h++]=(3&s)<<6|63&r;return l}function L(t){var e,i=new Uint8Array(t),n="";for(e=0;e<i.length;e+=3)n+=C[i[e]>>2],n+=C[(3&i[e])<<4|i[e+1]>>4],n+=C[(15&i[e+1])<<2|i[e+2]>>6],n+=C[63&i[e+2]];return i.length%3==2?n=n.substring(0,n.length-1)+"=":i.length%3==1&&(n=n.substring(0,n.length-2)+"=="),n}var j={serialize:function(t,e){var i="";if(t&&(i=k.call(t)),t&&("[object ArrayBuffer]"===i||t.buffer&&"[object ArrayBuffer]"===k.call(t.buffer))){var n,s="__lfsc__:";t instanceof ArrayBuffer?(n=t,s+="arbf"):(n=t.buffer,"[object Int8Array]"===i?s+="si08":"[object Uint8Array]"===i?s+="ui08":"[object Uint8ClampedArray]"===i?s+="uic8":"[object Int16Array]"===i?s+="si16":"[object Uint16Array]"===i?s+="ur16":"[object Int32Array]"===i?s+="si32":"[object Uint32Array]"===i?s+="ui32":"[object Float32Array]"===i?s+="fl32":"[object Float64Array]"===i?s+="fl64":e(new Error("Failed to get type for BinaryArray"))),e(s+L(n))}else if("[object Blob]"===i){var r=new FileReader;r.onload=function(){var i="~~local_forage_type~"+t.type+"~"+L(this.result);e("__lfsc__:blob"+i)},r.readAsArrayBuffer(t)}else try{e(JSON.stringify(t))}catch(i){console.error("Couldn't convert value into a JSON string: ",t),e(null,i)}},deserialize:function(t){if("__lfsc__:"!==t.substring(0,I))return JSON.parse(t);var e,i=t.substring(R),n=t.substring(I,R);if("blob"===n&&O.test(i)){var s=i.match(O);e=s[1],i=i.substring(s[0].length)}var o=A(i);switch(n){case"arbf":return o;case"blob":return r([o],{type:e});case"si08":return new Int8Array(o);case"ui08":return new Uint8Array(o);case"uic8":return new Uint8ClampedArray(o);case"si16":return new Int16Array(o);case"ur16":return new Uint16Array(o);case"si32":return new Int32Array(o);case"ui32":return new Uint32Array(o);case"fl32":return new Float32Array(o);case"fl64":return new Float64Array(o);default:throw new Error("Unkown type: "+n)}},stringToBuffer:A,bufferToString:L};function D(t,e,i,n){t.executeSql("CREATE TABLE IF NOT EXISTS "+e.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],i,n)}function P(t,e,i,n,s,r){t.executeSql(i,n,s,(function(t,o){o.code===o.SYNTAX_ERR?t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?",[e.storeName],(function(t,a){a.rows.length?r(t,o):D(t,e,(function(){t.executeSql(i,n,s,r)}),r)}),r):r(t,o)}),r)}function M(t,e,i,n){var s=this;t=l(t);var r=new o((function(r,o){s.ready().then((function(){void 0===e&&(e=null);var a=e,h=s._dbInfo;h.serializer.serialize(e,(function(e,l){l?o(l):h.db.transaction((function(i){P(i,h,"INSERT OR REPLACE INTO "+h.storeName+" (key, value) VALUES (?, ?)",[t,e],(function(){r(a)}),(function(t,e){o(e)}))}),(function(e){if(e.code===e.QUOTA_ERR){if(n>0)return void r(M.apply(s,[t,a,i,n-1]));o(e)}}))}))})).catch(o)}));return a(r,i),r}function z(t){return new o((function(e,i){t.transaction((function(n){n.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],(function(i,n){for(var s=[],r=0;r<n.rows.length;r++)s.push(n.rows.item(r).name);e({db:t,storeNames:s})}),(function(t,e){i(e)}))}),(function(t){i(t)}))}))}var B={_driver:"webSQLStorage",_initStorage:function(t){var e=this,i={db:null};if(t)for(var n in t)i[n]="string"!=typeof t[n]?t[n].toString():t[n];var s=new o((function(t,n){try{i.db=openDatabase(i.name,String(i.version),i.description,i.size)}catch(t){return n(t)}i.db.transaction((function(s){D(s,i,(function(){e._dbInfo=i,t()}),(function(t,e){n(e)}))}),n)}));return i.serializer=j,s},_support:"function"==typeof openDatabase,iterate:function(t,e){var i=this,n=new o((function(e,n){i.ready().then((function(){var s=i._dbInfo;s.db.transaction((function(i){P(i,s,"SELECT * FROM "+s.storeName,[],(function(i,n){for(var r=n.rows,o=r.length,a=0;a<o;a++){var h=r.item(a),l=h.value;if(l&&(l=s.serializer.deserialize(l)),void 0!==(l=t(l,h.key,a+1)))return void e(l)}e()}),(function(t,e){n(e)}))}))})).catch(n)}));return a(n,e),n},getItem:function(t,e){var i=this;t=l(t);var n=new o((function(e,n){i.ready().then((function(){var s=i._dbInfo;s.db.transaction((function(i){P(i,s,"SELECT * FROM "+s.storeName+" WHERE key = ? LIMIT 1",[t],(function(t,i){var n=i.rows.length?i.rows.item(0).value:null;n&&(n=s.serializer.deserialize(n)),e(n)}),(function(t,e){n(e)}))}))})).catch(n)}));return a(n,e),n},setItem:function(t,e,i){return M.apply(this,[t,e,i,1])},removeItem:function(t,e){var i=this;t=l(t);var n=new o((function(e,n){i.ready().then((function(){var s=i._dbInfo;s.db.transaction((function(i){P(i,s,"DELETE FROM "+s.storeName+" WHERE key = ?",[t],(function(){e()}),(function(t,e){n(e)}))}))})).catch(n)}));return a(n,e),n},clear:function(t){var e=this,i=new o((function(t,i){e.ready().then((function(){var n=e._dbInfo;n.db.transaction((function(e){P(e,n,"DELETE FROM "+n.storeName,[],(function(){t()}),(function(t,e){i(e)}))}))})).catch(i)}));return a(i,t),i},length:function(t){var e=this,i=new o((function(t,i){e.ready().then((function(){var n=e._dbInfo;n.db.transaction((function(e){P(e,n,"SELECT COUNT(key) as c FROM "+n.storeName,[],(function(e,i){var n=i.rows.item(0).c;t(n)}),(function(t,e){i(e)}))}))})).catch(i)}));return a(i,t),i},key:function(t,e){var i=this,n=new o((function(e,n){i.ready().then((function(){var s=i._dbInfo;s.db.transaction((function(i){P(i,s,"SELECT key FROM "+s.storeName+" WHERE id = ? LIMIT 1",[t+1],(function(t,i){var n=i.rows.length?i.rows.item(0).key:null;e(n)}),(function(t,e){n(e)}))}))})).catch(n)}));return a(n,e),n},keys:function(t){var e=this,i=new o((function(t,i){e.ready().then((function(){var n=e._dbInfo;n.db.transaction((function(e){P(e,n,"SELECT key FROM "+n.storeName,[],(function(e,i){for(var n=[],s=0;s<i.rows.length;s++)n.push(i.rows.item(s).key);t(n)}),(function(t,e){i(e)}))}))})).catch(i)}));return a(i,t),i},dropInstance:function(t,e){e=c.apply(this,arguments);var i=this.config();(t="function"!=typeof t&&t||{}).name||(t.name=t.name||i.name,t.storeName=t.storeName||i.storeName);var n,s=this;return a(n=t.name?new o((function(e){var n;n=t.name===i.name?s._dbInfo.db:openDatabase(t.name,"","",0),t.storeName?e({db:n,storeNames:[t.storeName]}):e(z(n))})).then((function(t){return new o((function(e,i){t.db.transaction((function(n){function s(t){return new o((function(e,i){n.executeSql("DROP TABLE IF EXISTS "+t,[],(function(){e()}),(function(t,e){i(e)}))}))}for(var r=[],a=0,h=t.storeNames.length;a<h;a++)r.push(s(t.storeNames[a]));o.all(r).then((function(){e()})).catch((function(t){i(t)}))}),(function(t){i(t)}))}))})):o.reject("Invalid arguments"),e),n}};function q(t,e){var i=t.name+"/";return t.storeName!==e.storeName&&(i+=t.storeName+"/"),i}function F(){return!function(){try{return localStorage.setItem("_localforage_support_test",!0),localStorage.removeItem("_localforage_support_test"),!1}catch(t){return!0}}()||localStorage.length>0}var U={_driver:"localStorageWrapper",_initStorage:function(t){var e={};if(t)for(var i in t)e[i]=t[i];return e.keyPrefix=q(t,this._defaultConfig),F()?(this._dbInfo=e,e.serializer=j,o.resolve()):o.reject()},_support:function(){try{return"undefined"!=typeof localStorage&&"setItem"in localStorage&&!!localStorage.setItem}catch(t){return!1}}(),iterate:function(t,e){var i=this,n=i.ready().then((function(){for(var e=i._dbInfo,n=e.keyPrefix,s=n.length,r=localStorage.length,o=1,a=0;a<r;a++){var h=localStorage.key(a);if(0===h.indexOf(n)){var l=localStorage.getItem(h);if(l&&(l=e.serializer.deserialize(l)),void 0!==(l=t(l,h.substring(s),o++)))return l}}}));return a(n,e),n},getItem:function(t,e){var i=this;t=l(t);var n=i.ready().then((function(){var e=i._dbInfo,n=localStorage.getItem(e.keyPrefix+t);return n&&(n=e.serializer.deserialize(n)),n}));return a(n,e),n},setItem:function(t,e,i){var n=this;t=l(t);var s=n.ready().then((function(){void 0===e&&(e=null);var i=e;return new o((function(s,r){var o=n._dbInfo;o.serializer.serialize(e,(function(e,n){if(n)r(n);else try{localStorage.setItem(o.keyPrefix+t,e),s(i)}catch(t){"QuotaExceededError"!==t.name&&"NS_ERROR_DOM_QUOTA_REACHED"!==t.name||r(t),r(t)}}))}))}));return a(s,i),s},removeItem:function(t,e){var i=this;t=l(t);var n=i.ready().then((function(){var e=i._dbInfo;localStorage.removeItem(e.keyPrefix+t)}));return a(n,e),n},clear:function(t){var e=this,i=e.ready().then((function(){for(var t=e._dbInfo.keyPrefix,i=localStorage.length-1;i>=0;i--){var n=localStorage.key(i);0===n.indexOf(t)&&localStorage.removeItem(n)}}));return a(i,t),i},length:function(t){var e=this.keys().then((function(t){return t.length}));return a(e,t),e},key:function(t,e){var i=this,n=i.ready().then((function(){var e,n=i._dbInfo;try{e=localStorage.key(t)}catch(t){e=null}return e&&(e=e.substring(n.keyPrefix.length)),e}));return a(n,e),n},keys:function(t){var e=this,i=e.ready().then((function(){for(var t=e._dbInfo,i=localStorage.length,n=[],s=0;s<i;s++){var r=localStorage.key(s);0===r.indexOf(t.keyPrefix)&&n.push(r.substring(t.keyPrefix.length))}return n}));return a(i,t),i},dropInstance:function(t,e){if(e=c.apply(this,arguments),!(t="function"!=typeof t&&t||{}).name){var i=this.config();t.name=t.name||i.name,t.storeName=t.storeName||i.storeName}var n,s=this;return a(n=t.name?new o((function(e){t.storeName?e(q(t,s._defaultConfig)):e(t.name+"/")})).then((function(t){for(var e=localStorage.length-1;e>=0;e--){var i=localStorage.key(e);0===i.indexOf(t)&&localStorage.removeItem(i)}})):o.reject("Invalid arguments"),e),n}},W=function(t,e){for(var i,n,s=t.length,r=0;r<s;){if((i=t[r])===(n=e)||"number"==typeof i&&"number"==typeof n&&isNaN(i)&&isNaN(n))return!0;r++}return!1},H=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},V={},X={},G={INDEXEDDB:T,WEBSQL:B,LOCALSTORAGE:U},Y=[G.INDEXEDDB._driver,G.WEBSQL._driver,G.LOCALSTORAGE._driver],$=["dropInstance"],K=["clear","getItem","iterate","key","keys","length","removeItem","setItem"].concat($),Z={description:"",driver:Y.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1};function J(t,e){t[e]=function(){var i=arguments;return t.ready().then((function(){return t[e].apply(t,i)}))}}function Q(){for(var t=1;t<arguments.length;t++){var e=arguments[t];if(e)for(var i in e)e.hasOwnProperty(i)&&(H(e[i])?arguments[0][i]=e[i].slice():arguments[0][i]=e[i])}return arguments[0]}var tt=new(function(){function t(e){for(var i in function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),G)if(G.hasOwnProperty(i)){var n=G[i],s=n._driver;this[i]=s,V[s]||this.defineDriver(n)}this._defaultConfig=Q({},Z),this._config=Q({},this._defaultConfig,e),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch((function(){}))}return t.prototype.config=function(t){if("object"===(void 0===t?"undefined":n(t))){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var e in t){if("storeName"===e&&(t[e]=t[e].replace(/\\W/g,"_")),"version"===e&&"number"!=typeof t[e])return new Error("Database version must be a number.");this._config[e]=t[e]}return!("driver"in t)||!t.driver||this.setDriver(this._config.driver)}return"string"==typeof t?this._config[t]:this._config},t.prototype.defineDriver=function(t,e,i){var n=new o((function(e,i){try{var n=t._driver,s=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!t._driver)return void i(s);for(var r=K.concat("_initStorage"),h=0,l=r.length;h<l;h++){var c=r[h];if((!W($,c)||t[c])&&"function"!=typeof t[c])return void i(s)}!function(){for(var e=function(t){return function(){var e=new Error("Method "+t+" is not implemented by the current driver"),i=o.reject(e);return a(i,arguments[arguments.length-1]),i}},i=0,n=$.length;i<n;i++){var s=$[i];t[s]||(t[s]=e(s))}}();var u=function(i){V[n]&&console.info("Redefining LocalForage driver: "+n),V[n]=t,X[n]=i,e()};"_support"in t?t._support&&"function"==typeof t._support?t._support().then(u,i):u(!!t._support):u(!0)}catch(t){i(t)}}));return h(n,e,i),n},t.prototype.driver=function(){return this._driver||null},t.prototype.getDriver=function(t,e,i){var n=V[t]?o.resolve(V[t]):o.reject(new Error("Driver not found."));return h(n,e,i),n},t.prototype.getSerializer=function(t){var e=o.resolve(j);return h(e,t),e},t.prototype.ready=function(t){var e=this,i=e._driverSet.then((function(){return null===e._ready&&(e._ready=e._initDriver()),e._ready}));return h(i,t,t),i},t.prototype.setDriver=function(t,e,i){var n=this;H(t)||(t=[t]);var s=this._getSupportedDrivers(t);function r(){n._config.driver=n.driver()}function a(t){return n._extend(t),r(),n._ready=n._initStorage(n._config),n._ready}var l=null!==this._driverSet?this._driverSet.catch((function(){return o.resolve()})):o.resolve();return this._driverSet=l.then((function(){var t=s[0];return n._dbInfo=null,n._ready=null,n.getDriver(t).then((function(t){n._driver=t._driver,r(),n._wrapLibraryMethodsWithReady(),n._initDriver=function(t){return function(){var e=0;return function i(){for(;e<t.length;){var s=t[e];return e++,n._dbInfo=null,n._ready=null,n.getDriver(s).then(a).catch(i)}r();var h=new Error("No available storage method found.");return n._driverSet=o.reject(h),n._driverSet}()}}(s)}))})).catch((function(){r();var t=new Error("No available storage method found.");return n._driverSet=o.reject(t),n._driverSet})),h(this._driverSet,e,i),this._driverSet},t.prototype.supports=function(t){return!!X[t]},t.prototype._extend=function(t){Q(this,t)},t.prototype._getSupportedDrivers=function(t){for(var e=[],i=0,n=t.length;i<n;i++){var s=t[i];this.supports(s)&&e.push(s)}return e},t.prototype._wrapLibraryMethodsWithReady=function(){for(var t=0,e=K.length;t<e;t++)J(this,K[t])},t.prototype.createInstance=function(e){return new t(e)},t}());e.exports=tt},{3:3}]},{},[4])(4)}).call(this,i(17))},function(t,e,i){"use strict";var n=i(3),s=i.n(n),r=i(0),o=i(5),a=i(4),h=i(2),l=i(6),c=i(8);var u=function(t,e,i,n){var s,o="undefined"!=typeof window&&window.URL,h=o?"blob":"arraybuffer",l=new r.defer,c=new XMLHttpRequest,u=XMLHttpRequest.prototype;for(s in"overrideMimeType"in u||Object.defineProperty(u,"overrideMimeType",{value:function(){}}),i&&(c.withCredentials=!0),c.onreadystatechange=function(){if(this.readyState===XMLHttpRequest.DONE){var t=!1;if(""!==this.responseType&&"document"!==this.responseType||(t=this.responseXML),200===this.status||0===this.status||t){var i;if(!this.response&&!t)return l.reject({status:this.status,message:"Empty Response",stack:(new Error).stack}),l.promise;if(403===this.status)return l.reject({status:this.status,response:this.response,message:"Forbidden",stack:(new Error).stack}),l.promise;i=t?this.responseXML:Object(r.isXml)(e)?Object(r.parse)(this.response,"text/xml"):"xhtml"==e?Object(r.parse)(this.response,"application/xhtml+xml"):"html"==e||"htm"==e?Object(r.parse)(this.response,"text/html"):"json"==e?JSON.parse(this.response):"blob"==e?o?this.response:new Blob([this.response]):this.response,l.resolve(i)}else l.reject({status:this.status,message:this.response,stack:(new Error).stack})}},c.onerror=function(t){l.reject(t)},c.open("GET",t,!0),n)c.setRequestHeader(s,n[s]);return"json"==e&&c.setRequestHeader("Accept","application/json"),e||(e=new a.a(t).extension),"blob"==e&&(c.responseType=h),Object(r.isXml)(e)&&c.overrideMimeType("text/xml"),"binary"==e&&(c.responseType="arraybuffer"),c.send(),l.promise},d=i(15);var f=class{constructor(t,e){this.idref=t.idref,this.linear="yes"===t.linear,this.properties=t.properties,this.index=t.index,this.href=t.href,this.url=t.url,this.canonical=t.canonical,this.next=t.next,this.prev=t.prev,this.cfiBase=t.cfiBase,e?this.hooks=e:(this.hooks={},this.hooks.serialize=new l.a(this),this.hooks.content=new l.a(this)),this.document=void 0,this.contents=void 0,this.output=void 0}load(t){var e=t||this.request||u,i=new r.defer,n=i.promise;return this.contents?i.resolve(this.contents):e(this.url).then(function(t){return this.document=t,this.contents=t.documentElement,this.hooks.content.trigger(this.document,this)}.bind(this)).then(function(){i.resolve(this.contents)}.bind(this)).catch((function(t){i.reject(t)})),n}base(){return Object(c.a)(this.document,this)}render(t){var e=new r.defer,i=e.promise;return this.output,this.load(t).then(function(t){var e=("undefined"!=typeof navigator&&navigator.userAgent||"").indexOf("Trident")>=0,i=new("undefined"==typeof XMLSerializer||e?d.DOMParser:XMLSerializer);return this.output=i.serializeToString(t),this.output}.bind(this)).then(function(){return this.hooks.serialize.trigger(this.output,this)}.bind(this)).then(function(){e.resolve(this.output)}.bind(this)).catch((function(t){e.reject(t)})),i}find(t){var e=this,i=[],n=t.toLowerCase();return Object(r.sprint)(e.document,(function(t){!function(t){for(var s,r,o,a=t.textContent.toLowerCase(),h=e.document.createRange(),l=-1;-1!=r;)-1!=(r=a.indexOf(n,l+1))&&((h=e.document.createRange()).setStart(t,r),h.setEnd(t,r+n.length),s=e.cfiFromRange(h),o=t.textContent.length<150?t.textContent:"..."+(o=t.textContent.substring(r-75,r+75))+"...",i.push({cfi:s,excerpt:o})),l=r}(t)})),i}search(t,e=5){if(void 0===document.createTreeWalker)return this.find(t);let i=[];const n=this,s=t.toLowerCase(),r=function(t){const e=t.reduce((t,e)=>t+e.textContent,"").toLowerCase().indexOf(s);if(-1!=e){const r=0,o=e+s.length;let a=0,h=0;if(e<t[r].length){let s;for(;a<t.length-1&&(h+=t[a].length,!(o<=h));)a+=1;let l=t[r],c=t[a],u=n.document.createRange();u.setStart(l,e);let d=t.slice(0,a).reduce((t,e)=>t+e.textContent.length,0);u.setEnd(c,d>o?o:o-d),s=n.cfiFromRange(u);let f=t.slice(0,a+1).reduce((t,e)=>t+e.textContent,"");f.length>150&&(f=f.substring(e-75,e+75),f="..."+f+"..."),i.push({cfi:s,excerpt:f})}}},o=document.createTreeWalker(n.document,NodeFilter.SHOW_TEXT,null,!1);let a,h=[];for(;a=o.nextNode();)h.push(a),h.length==e&&(r(h.slice(0,e)),h=h.slice(1,e));return h.length>0&&r(h),i}reconcileLayoutSettings(t){var e={layout:t.layout,spread:t.spread,orientation:t.orientation};return this.properties.forEach((function(t){var i,n,s=t.replace("rendition:",""),r=s.indexOf("-");-1!=r&&(i=s.slice(0,r),n=s.slice(r+1),e[i]=n)})),e}cfiFromRange(t){return new h.a(t,this.cfiBase).toString()}cfiFromElement(t){return new h.a(t,this.cfiBase).toString()}unload(){this.document=void 0,this.contents=void 0,this.output=void 0}destroy(){this.unload(),this.hooks.serialize.clear(),this.hooks.content.clear(),this.hooks=void 0,this.idref=void 0,this.linear=void 0,this.properties=void 0,this.index=void 0,this.href=void 0,this.url=void 0,this.next=void 0,this.prev=void 0,this.cfiBase=void 0}};var p=class{constructor(){this.spineItems=[],this.spineByHref={},this.spineById={},this.hooks={},this.hooks.serialize=new l.a,this.hooks.content=new l.a,this.hooks.content.register(c.a),this.hooks.content.register(c.b),this.hooks.content.register(c.d),this.epubcfi=new h.a,this.loaded=!1,this.items=void 0,this.manifest=void 0,this.spineNodeIndex=void 0,this.baseUrl=void 0,this.length=void 0}unpack(t,e,i){this.items=t.spine,this.manifest=t.manifest,this.spineNodeIndex=t.spineNodeIndex,this.baseUrl=t.baseUrl||t.basePath||"",this.length=this.items.length,this.items.forEach((t,n)=>{var s,r=this.manifest[t.idref];t.index=n,t.cfiBase=this.epubcfi.generateChapterComponent(this.spineNodeIndex,t.index,t.id),t.href&&(t.url=e(t.href,!0),t.canonical=i(t.href)),r&&(t.href=r.href,t.url=e(t.href,!0),t.canonical=i(t.href),r.properties.length&&t.properties.push.apply(t.properties,r.properties)),"yes"===t.linear?(t.prev=function(){let e=t.index;for(;e>0;){let t=this.get(e-1);if(t&&t.linear)return t;e-=1}}.bind(this),t.next=function(){let e=t.index;for(;e<this.spineItems.length-1;){let t=this.get(e+1);if(t&&t.linear)return t;e+=1}}.bind(this)):(t.prev=function(){},t.next=function(){}),s=new f(t,this.hooks),this.append(s)}),this.loaded=!0}get(t){var e=0;if(void 0===t)for(;e<this.spineItems.length;){let t=this.spineItems[e];if(t&&t.linear)break;e+=1}else if(this.epubcfi.isCfiString(t)){e=new h.a(t).spinePos}else"number"==typeof t||!1===isNaN(t)?e=t:"string"==typeof t&&0===t.indexOf("#")?e=this.spineById[t.substring(1)]:"string"==typeof t&&(t=t.split("#")[0],e=this.spineByHref[t]||this.spineByHref[encodeURI(t)]);return this.spineItems[e]||null}append(t){var e=this.spineItems.length;return t.index=e,this.spineItems.push(t),this.spineByHref[decodeURI(t.href)]=e,this.spineByHref[encodeURI(t.href)]=e,this.spineByHref[t.href]=e,this.spineById[t.idref]=e,e}prepend(t){return this.spineByHref[t.href]=0,this.spineById[t.idref]=0,this.spineItems.forEach((function(t,e){t.index=e})),0}remove(t){var e=this.spineItems.indexOf(t);if(e>-1)return delete this.spineByHref[t.href],delete this.spineById[t.idref],this.spineItems.splice(e,1)}each(){return this.spineItems.forEach.apply(this.spineItems,arguments)}first(){let t=0;do{let e=this.get(t);if(e&&e.linear)return e;t+=1}while(t<this.spineItems.length)}last(){let t=this.spineItems.length-1;do{let e=this.get(t);if(e&&e.linear)return e;t-=1}while(t>=0)}destroy(){this.each(t=>t.destroy()),this.spineItems=void 0,this.spineByHref=void 0,this.spineById=void 0,this.hooks.serialize.clear(),this.hooks.content.clear(),this.hooks=void 0,this.epubcfi=void 0,this.loaded=!1,this.items=void 0,this.manifest=void 0,this.spineNodeIndex=void 0,this.baseUrl=void 0,this.length=void 0}},g=i(9),m=i(1);class v{constructor(t,e,i){this.spine=t,this.request=e,this.pause=i||100,this.q=new g.a(this),this.epubcfi=new h.a,this._locations=[],this._locationsWords=[],this.total=0,this.break=150,this._current=0,this._wordCounter=0,this.currentLocation="",this._currentCfi="",this.processingTimeout=void 0}generate(t){return t&&(this.break=t),this.q.pause(),this.spine.each(function(t){t.linear&&this.q.enqueue(this.process.bind(this),t)}.bind(this)),this.q.run().then(function(){return this.total=this._locations.length-1,this._currentCfi&&(this.currentLocation=this._currentCfi),this._locations}.bind(this))}createRange(){return{startContainer:void 0,startOffset:void 0,endContainer:void 0,endOffset:void 0}}process(t){return t.load(this.request).then(function(e){var i=new r.defer,n=this.parse(e,t.cfiBase);return this._locations=this._locations.concat(n),t.unload(),this.processingTimeout=setTimeout(()=>i.resolve(n),this.pause),i.promise}.bind(this))}parse(t,e,i){var n,s,o=[],a=t.ownerDocument,l=Object(r.qs)(a,"body"),c=0,u=i||this.break;if(Object(r.sprint)(l,function(t){var i,r=t.length,a=0;if(0===t.textContent.trim().length)return!1;for(0==c&&((n=this.createRange()).startContainer=t,n.startOffset=0),(i=u-c)>r&&(c+=r,a=r);a<r;)if(i=u-c,0===c&&(a+=1,(n=this.createRange()).startContainer=t,n.startOffset=a),a+i>=r)c+=r-a,a=r;else{a+=i,n.endContainer=t,n.endOffset=a;let s=new h.a(n,e).toString();o.push(s),c=0}s=t}.bind(this)),n&&n.startContainer&&s){n.endContainer=s,n.endOffset=s.length;let t=new h.a(n,e).toString();o.push(t),c=0}return o}generateFromWords(t,e,i){var n=t?new h.a(t):void 0;return this.q.pause(),this._locationsWords=[],this._wordCounter=0,this.spine.each(function(t){t.linear&&(n?t.index>=n.spinePos&&this.q.enqueue(this.processWords.bind(this),t,e,n,i):this.q.enqueue(this.processWords.bind(this),t,e,n,i))}.bind(this)),this.q.run().then(function(){return this._currentCfi&&(this.currentLocation=this._currentCfi),this._locationsWords}.bind(this))}processWords(t,e,i,n){return n&&this._locationsWords.length>=n?Promise.resolve():t.load(this.request).then(function(s){var o=new r.defer,a=this.parseWords(s,t,e,i),h=n-this._locationsWords.length;return this._locationsWords=this._locationsWords.concat(a.length>=n?a.slice(0,h):a),t.unload(),this.processingTimeout=setTimeout(()=>o.resolve(a),this.pause),o.promise}.bind(this))}countWords(t){return(t=(t=(t=t.replace(/(^\\s*)|(\\s*$)/gi,"")).replace(/[ ]{2,}/gi," ")).replace(/\\n /,"\\n")).split(" ").length}parseWords(t,e,i,n){var s,o=e.cfiBase,a=[],l=t.ownerDocument,c=Object(r.qs)(l,"body"),u=i,d=!n||n.spinePos!==e.index;n&&e.index===n.spinePos&&(s=n.findNode(n.range?n.path.steps.concat(n.start.steps):n.path.steps,t.ownerDocument));return Object(r.sprint)(c,function(t){if(!d){if(t!==s)return!1;d=!0}if(t.textContent.length<10&&0===t.textContent.trim().length)return!1;var e,i=this.countWords(t.textContent),n=0;if(0===i)return!1;for((e=u-this._wordCounter)>i&&(this._wordCounter+=i,n=i);n<i;)if(n+(e=u-this._wordCounter)>=i)this._wordCounter+=i-n,n=i;else{n+=e;let i=new h.a(t,o);a.push({cfi:i.toString(),wordCount:this._wordCounter}),this._wordCounter=0}t}.bind(this)),a}locationFromCfi(t){let e;return h.a.prototype.isCfiString(t)&&(t=new h.a(t)),0===this._locations.length?-1:(e=Object(r.locationOf)(t,this._locations,this.epubcfi.compare),e>this.total?this.total:e)}percentageFromCfi(t){if(0===this._locations.length)return null;var e=this.locationFromCfi(t);return this.percentageFromLocation(e)}percentageFromLocation(t){return t&&this.total?t/this.total:0}cfiFromLocation(t){var e=-1;return"number"!=typeof t&&(t=parseInt(t)),t>=0&&t<this._locations.length&&(e=this._locations[t]),e}cfiFromPercentage(t){let e;if(t>1&&console.warn("Normalize cfiFromPercentage value to between 0 - 1"),t>=1){let t=new h.a(this._locations[this.total]);return t.collapse(),t.toString()}return e=Math.ceil(this.total*t),this.cfiFromLocation(e)}load(t){return this._locations="string"==typeof t?JSON.parse(t):t,this.total=this._locations.length-1,this._locations}save(){return JSON.stringify(this._locations)}getCurrent(){return this._current}setCurrent(t){var e;if("string"==typeof t)this._currentCfi=t;else{if("number"!=typeof t)return;this._current=t}0!==this._locations.length&&("string"==typeof t?(e=this.locationFromCfi(t),this._current=e):e=t,this.emit(m.c.LOCATIONS.CHANGED,{percentage:this.percentageFromLocation(e)}))}get currentLocation(){return this._current}set currentLocation(t){this.setCurrent(t)}length(){return this._locations.length}destroy(){this.spine=void 0,this.request=void 0,this.pause=void 0,this.q.stop(),this.q=void 0,this.epubcfi=void 0,this._locations=void 0,this.total=void 0,this.break=void 0,this._current=void 0,this.currentLocation=void 0,this._currentCfi=void 0,clearTimeout(this.processingTimeout)}}s()(v.prototype);var y=v,b=i(7),w=i.n(b);var x=class{constructor(t){this.packagePath="",this.directory="",this.encoding="",t&&this.parse(t)}parse(t){var e;if(!t)throw new Error("Container File Not Found");if(!(e=Object(r.qs)(t,"rootfile")))throw new Error("No RootFile Found");this.packagePath=e.getAttribute("full-path"),this.directory=w.a.dirname(this.packagePath),this.encoding=t.xmlEncoding}destroy(){this.packagePath=void 0,this.directory=void 0,this.encoding=void 0}};var E=class{constructor(t){this.manifest={},this.navPath="",this.ncxPath="",this.coverPath="",this.spineNodeIndex=0,this.spine=[],this.metadata={},t&&this.parse(t)}parse(t){var e,i,n;if(!t)throw new Error("Package File Not Found");if(!(e=Object(r.qs)(t,"metadata")))throw new Error("No Metadata Found");if(!(i=Object(r.qs)(t,"manifest")))throw new Error("No Manifest Found");if(!(n=Object(r.qs)(t,"spine")))throw new Error("No Spine Found");return this.manifest=this.parseManifest(i),this.navPath=this.findNavPath(i),this.ncxPath=this.findNcxPath(i,n),this.coverPath=this.findCoverPath(t),this.spineNodeIndex=Object(r.indexOfElementNode)(n),this.spine=this.parseSpine(n,this.manifest),this.uniqueIdentifier=this.findUniqueIdentifier(t),this.metadata=this.parseMetadata(e),this.metadata.direction=n.getAttribute("page-progression-direction"),{metadata:this.metadata,spine:this.spine,manifest:this.manifest,navPath:this.navPath,ncxPath:this.ncxPath,coverPath:this.coverPath,spineNodeIndex:this.spineNodeIndex}}parseMetadata(t){var e={};return e.title=this.getElementText(t,"title"),e.creator=this.getElementText(t,"creator"),e.description=this.getElementText(t,"description"),e.pubdate=this.getElementText(t,"date"),e.publisher=this.getElementText(t,"publisher"),e.identifier=this.getElementText(t,"identifier"),e.language=this.getElementText(t,"language"),e.rights=this.getElementText(t,"rights"),e.modified_date=this.getPropertyText(t,"dcterms:modified"),e.layout=this.getPropertyText(t,"rendition:layout"),e.orientation=this.getPropertyText(t,"rendition:orientation"),e.flow=this.getPropertyText(t,"rendition:flow"),e.viewport=this.getPropertyText(t,"rendition:viewport"),e.media_active_class=this.getPropertyText(t,"media:active-class"),e.spread=this.getPropertyText(t,"rendition:spread"),e}parseManifest(t){var e={},i=Object(r.qsa)(t,"item");return Array.prototype.slice.call(i).forEach((function(t){var i=t.getAttribute("id"),n=t.getAttribute("href")||"",s=t.getAttribute("media-type")||"",r=t.getAttribute("media-overlay")||"",o=t.getAttribute("properties")||"";e[i]={href:n,type:s,overlay:r,properties:o.length?o.split(" "):[]}})),e}parseSpine(t,e){var i=[],n=Object(r.qsa)(t,"itemref");return Array.prototype.slice.call(n).forEach((function(t,e){var n=t.getAttribute("idref"),s=t.getAttribute("properties")||"",r=s.length?s.split(" "):[],o={id:t.getAttribute("id"),idref:n,linear:t.getAttribute("linear")||"yes",properties:r,index:e};i.push(o)})),i}findUniqueIdentifier(t){var e=t.documentElement.getAttribute("unique-identifier");if(!e)return"";var i=t.getElementById(e);return i&&"identifier"===i.localName&&"http://purl.org/dc/elements/1.1/"===i.namespaceURI&&i.childNodes.length>0?i.childNodes[0].nodeValue.trim():""}findNavPath(t){var e=Object(r.qsp)(t,"item",{properties:"nav"});return!!e&&e.getAttribute("href")}findNcxPath(t,e){var i,n=Object(r.qsp)(t,"item",{"media-type":"application/x-dtbncx+xml"});return n||(i=e.getAttribute("toc"))&&(n=t.querySelector("#"+i)),!!n&&n.getAttribute("href")}findCoverPath(t){Object(r.qs)(t,"package").getAttribute("version");var e=Object(r.qsp)(t,"item",{properties:"cover-image"});if(e)return e.getAttribute("href");var i=Object(r.qsp)(t,"meta",{name:"cover"});if(i){var n=i.getAttribute("content"),s=t.getElementById(n);return s?s.getAttribute("href"):""}return!1}getElementText(t,e){var i,n=t.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/",e);return n&&0!==n.length&&(i=n[0]).childNodes.length?i.childNodes[0].nodeValue:""}getPropertyText(t,e){var i=Object(r.qsp)(t,"meta",{property:e});return i&&i.childNodes.length?i.childNodes[0].nodeValue:""}load(t){this.metadata=t.metadata;let e=t.readingOrder||t.spine;return this.spine=e.map((t,e)=>(t.index=e,t.linear=t.linear||"yes",t)),t.resources.forEach((t,e)=>{this.manifest[e]=t,t.rel&&"cover"===t.rel[0]&&(this.coverPath=t.href)}),this.spineNodeIndex=0,this.toc=t.toc.map((t,e)=>(t.label=t.title,t)),{metadata:this.metadata,spine:this.spine,manifest:this.manifest,navPath:this.navPath,ncxPath:this.ncxPath,coverPath:this.coverPath,spineNodeIndex:this.spineNodeIndex,toc:this.toc}}destroy(){this.manifest=void 0,this.navPath=void 0,this.ncxPath=void 0,this.coverPath=void 0,this.spineNodeIndex=void 0,this.spine=void 0,this.metadata=void 0}};var S=class{constructor(t){this.toc=[],this.tocByHref={},this.tocById={},this.landmarks=[],this.landmarksByType={},this.length=0,t&&this.parse(t)}parse(t){let e,i,n=t.nodeType;n&&(e=Object(r.qs)(t,"html"),i=Object(r.qs)(t,"ncx")),n?e?(this.toc=this.parseNav(t),this.landmarks=this.parseLandmarks(t)):i&&(this.toc=this.parseNcx(t)):this.toc=this.load(t),this.length=0,this.unpack(this.toc)}unpack(t){for(var e,i=0;i<t.length;i++)(e=t[i]).href&&(this.tocByHref[e.href]=i),e.id&&(this.tocById[e.id]=i),this.length++,e.subitems.length&&this.unpack(e.subitems)}get(t){var e;return t?(0===t.indexOf("#")?e=this.tocById[t.substring(1)]:t in this.tocByHref&&(e=this.tocByHref[t]),this.getByIndex(t,e,this.toc)):this.toc}getByIndex(t,e,i){if(0===i.length)return;const n=i[e];if(!n||t!==n.id&&t!==n.href){let n;for(let s=0;s<i.length&&(n=this.getByIndex(t,e,i[s].subitems),!n);++s);return n}return n}landmark(t){var e;return t?(e=this.landmarksByType[t],this.landmarks[e]):this.landmarks}parseNav(t){var e=Object(r.querySelectorByType)(t,"nav","toc"),i=[];if(!e)return i;let n=Object(r.filterChildren)(e,"ol",!0);return n?i=this.parseNavList(n):i}parseNavList(t,e){const i=[];if(!t)return i;if(!t.children)return i;for(let n=0;n<t.children.length;n++){const s=this.navItem(t.children[n],e);s&&i.push(s)}return i}navItem(t,e){let i=t.getAttribute("id")||void 0,n=Object(r.filterChildren)(t,"a",!0)||Object(r.filterChildren)(t,"span",!0);if(!n)return;let s=n.getAttribute("href")||"";i||(i=s);let o=n.textContent||"",a=[],h=Object(r.filterChildren)(t,"ol",!0);return h&&(a=this.parseNavList(h,i)),{id:i,href:s,label:o,subitems:a,parent:e}}parseLandmarks(t){var e,i,n=Object(r.querySelectorByType)(t,"nav","landmarks"),s=n?Object(r.qsa)(n,"li"):[],o=s.length,a=[];if(!s||0===o)return a;for(e=0;e<o;++e)(i=this.landmarkItem(s[e]))&&(a.push(i),this.landmarksByType[i.type]=e);return a}landmarkItem(t){let e=Object(r.filterChildren)(t,"a",!0);if(!e)return;let i=e.getAttributeNS("http://www.idpf.org/2007/ops","type")||void 0;return{href:e.getAttribute("href")||"",label:e.textContent||"",type:i}}parseNcx(t){var e,i,n=Object(r.qsa)(t,"navPoint"),s=n.length,o={},a=[];if(!n||0===s)return a;for(e=0;e<s;++e)o[(i=this.ncxItem(n[e])).id]=i,i.parent?o[i.parent].subitems.push(i):a.push(i);return a}ncxItem(t){var e,i=t.getAttribute("id")||!1,n=Object(r.qs)(t,"content").getAttribute("src"),s=Object(r.qs)(t,"navLabel"),o=s.textContent?s.textContent:"",a=t.parentNode;return!a||"navPoint"!==a.nodeName&&"navPoint"!==a.nodeName.split(":").slice(-1)[0]||(e=a.getAttribute("id")),{id:i,href:n,label:o,subitems:[],parent:e}}load(t){return t.map(t=>(t.label=t.title,t.subitems=t.children?this.load(t.children):[],t))}forEach(t){return this.toc.forEach(t)}},N={application:{ecmascript:["es","ecma"],javascript:"js",ogg:"ogx",pdf:"pdf",postscript:["ps","ai","eps","epsi","epsf","eps2","eps3"],"rdf+xml":"rdf",smil:["smi","smil"],"xhtml+xml":["xhtml","xht"],xml:["xml","xsl","xsd","opf","ncx"],zip:"zip","x-httpd-eruby":"rhtml","x-latex":"latex","x-maker":["frm","maker","frame","fm","fb","book","fbdoc"],"x-object":"o","x-shockwave-flash":["swf","swfl"],"x-silverlight":"scr","epub+zip":"epub","font-tdpfr":"pfr","inkml+xml":["ink","inkml"],json:"json","jsonml+json":"jsonml","mathml+xml":"mathml","metalink+xml":"metalink",mp4:"mp4s","omdoc+xml":"omdoc",oxps:"oxps","vnd.amazon.ebook":"azw",widget:"wgt","x-dtbook+xml":"dtb","x-dtbresource+xml":"res","x-font-bdf":"bdf","x-font-ghostscript":"gsf","x-font-linux-psf":"psf","x-font-otf":"otf","x-font-pcf":"pcf","x-font-snf":"snf","x-font-ttf":["ttf","ttc"],"x-font-type1":["pfa","pfb","pfm","afm"],"x-font-woff":"woff","x-mobipocket-ebook":["prc","mobi"],"x-mspublisher":"pub","x-nzb":"nzb","x-tgif":"obj","xaml+xml":"xaml","xml-dtd":"dtd","xproc+xml":"xpl","xslt+xml":"xslt","internet-property-stream":"acx","x-compress":"z","x-compressed":"tgz","x-gzip":"gz"},audio:{flac:"flac",midi:["mid","midi","kar","rmi"],mpeg:["mpga","mpega","mp2","mp3","m4a","mp2a","m2a","m3a"],mpegurl:"m3u",ogg:["oga","ogg","spx"],"x-aiff":["aif","aiff","aifc"],"x-ms-wma":"wma","x-wav":"wav",adpcm:"adp",mp4:"mp4a",webm:"weba","x-aac":"aac","x-caf":"caf","x-matroska":"mka","x-pn-realaudio-plugin":"rmp",xm:"xm",mid:["mid","rmi"]},image:{gif:"gif",ief:"ief",jpeg:["jpeg","jpg","jpe"],pcx:"pcx",png:"png","svg+xml":["svg","svgz"],tiff:["tiff","tif"],"x-icon":"ico",bmp:"bmp",webp:"webp","x-pict":["pic","pct"],"x-tga":"tga","cis-cod":"cod"},text:{"cache-manifest":["manifest","appcache"],css:"css",csv:"csv",html:["html","htm","shtml","stm"],mathml:"mml",plain:["txt","text","brf","conf","def","list","log","in","bas"],richtext:"rtx","tab-separated-values":"tsv","x-bibtex":"bib"},video:{mpeg:["mpeg","mpg","mpe","m1v","m2v","mp2","mpa","mpv2"],mp4:["mp4","mp4v","mpg4"],quicktime:["qt","mov"],ogg:"ogv","vnd.mpegurl":["mxu","m4u"],"x-flv":"flv","x-la-asf":["lsf","lsx"],"x-mng":"mng","x-ms-asf":["asf","asx","asr"],"x-ms-wm":"wm","x-ms-wmv":"wmv","x-ms-wmx":"wmx","x-ms-wvx":"wvx","x-msvideo":"avi","x-sgi-movie":"movie","x-matroska":["mpv","mkv","mk3d","mks"],"3gpp2":"3g2",h261:"h261",h263:"h263",h264:"h264",jpeg:"jpgv",jpm:["jpm","jpgm"],mj2:["mj2","mjp2"],"vnd.ms-playready.media.pyv":"pyv","vnd.uvvu.mp4":["uvu","uvvu"],"vnd.vivo":"viv",webm:"webm","x-f4v":"f4v","x-m4v":"m4v","x-ms-vob":"vob","x-smv":"smv"}},_=function(){var t,e,i,n,s={};for(t in N)if(N.hasOwnProperty(t))for(e in N[t])if(N[t].hasOwnProperty(e))if("string"==typeof(i=N[t][e]))s[i]=t+"/"+e;else for(n=0;n<i.length;n++)s[i[n]]=t+"/"+e;return s}();var T={lookup:function(t){return t&&_[t.split(".").pop().toLowerCase()]||"text/plain"}};var C=class{constructor(t,e){this.settings={replacements:e&&e.replacements||"base64",archive:e&&e.archive,resolver:e&&e.resolver,request:e&&e.request},this.process(t)}process(t){this.manifest=t,this.resources=Object.keys(t).map((function(e){return t[e]})),this.replacementUrls=[],this.html=[],this.assets=[],this.css=[],this.urls=[],this.cssUrls=[],this.split(),this.splitUrls()}split(){this.html=this.resources.filter((function(t){if("application/xhtml+xml"===t.type||"text/html"===t.type)return!0})),this.assets=this.resources.filter((function(t){if("application/xhtml+xml"!==t.type&&"text/html"!==t.type)return!0})),this.css=this.resources.filter((function(t){if("text/css"===t.type)return!0}))}splitUrls(){this.urls=this.assets.map(function(t){return t.href}.bind(this)),this.cssUrls=this.css.map((function(t){return t.href}))}createUrl(t){var e=new o.a(t),i=T.lookup(e.filename);return this.settings.archive?this.settings.archive.createUrl(t,{base64:"base64"===this.settings.replacements}):"base64"===this.settings.replacements?this.settings.request(t,"blob").then(t=>Object(r.blob2base64)(t)).then(t=>Object(r.createBase64Url)(t,i)):this.settings.request(t,"blob").then(t=>Object(r.createBlobUrl)(t,i))}replacements(){if("none"===this.settings.replacements)return new Promise(function(t){t(this.urls)}.bind(this));var t=this.urls.map(t=>{var e=this.settings.resolver(t);return this.createUrl(e).catch(t=>(console.error(t),null))});return Promise.all(t).then(t=>(this.replacementUrls=t.filter(t=>"string"==typeof t),t))}replaceCss(t,e){var i=[];return t=t||this.settings.archive,e=e||this.settings.resolver,this.cssUrls.forEach(function(n){var s=this.createCssFile(n,t,e).then(function(t){var e=this.urls.indexOf(n);e>-1&&(this.replacementUrls[e]=t)}.bind(this));i.push(s)}.bind(this)),Promise.all(i)}createCssFile(t){if(w.a.isAbsolute(t))return new Promise((function(t){t()}));var e,i=this.settings.resolver(t);e=this.settings.archive?this.settings.archive.getText(i):this.settings.request(i,"text");var n=this.urls.map(t=>{var e=this.settings.resolver(t);return new a.a(i).relative(e)});return e?e.then(t=>(t=Object(c.e)(t,n,this.replacementUrls),"base64"===this.settings.replacements?Object(r.createBase64Url)(t,"text/css"):Object(r.createBlobUrl)(t,"text/css")),t=>new Promise((function(t){t()}))):new Promise((function(t){t()}))}relativeTo(t,e){return e=e||this.settings.resolver,this.urls.map(function(i){var n=e(i);return new a.a(t).relative(n)}.bind(this))}get(t){var e=this.urls.indexOf(t);if(-1!==e)return this.replacementUrls.length?new Promise(function(t,i){t(this.replacementUrls[e])}.bind(this)):this.createUrl(t)}substitute(t,e){var i;return i=e?this.relativeTo(e):this.urls,Object(c.e)(t,i,this.replacementUrls)}destroy(){this.settings=void 0,this.manifest=void 0,this.resources=void 0,this.replacementUrls=void 0,this.html=void 0,this.assets=void 0,this.css=void 0,this.urls=void 0,this.cssUrls=void 0}};var O=class{constructor(t){this.pages=[],this.locations=[],this.epubcfi=new h.a,this.firstPage=0,this.lastPage=0,this.totalPages=0,this.toc=void 0,this.ncx=void 0,t&&(this.pageList=this.parse(t)),this.pageList&&this.pageList.length&&this.process(this.pageList)}parse(t){var e=Object(r.qs)(t,"html"),i=Object(r.qs)(t,"ncx");return e?this.parseNav(t):i?this.parseNcx(t):void 0}parseNav(t){var e,i,n=Object(r.querySelectorByType)(t,"nav","page-list"),s=n?Object(r.qsa)(n,"li"):[],o=s.length,a=[];if(!s||0===o)return a;for(e=0;e<o;++e)i=this.item(s[e]),a.push(i);return a}parseNcx(t){var e,i,n,s,o=[],a=0;if(!(i=Object(r.qs)(t,"pageList")))return o;if(s=(n=Object(r.qsa)(i,"pageTarget")).length,!n||0===n.length)return o;for(a=0;a<s;++a)e=this.ncxItem(n[a]),o.push(e);return o}ncxItem(t){var e=Object(r.qs)(t,"navLabel"),i=Object(r.qs)(e,"text").textContent;return{href:Object(r.qs)(t,"content").getAttribute("src"),page:parseInt(i,10)}}item(t){var e,i,n=Object(r.qs)(t,"a"),s=n.getAttribute("href")||"",o=n.textContent||"",a=parseInt(o);return-1!=s.indexOf("epubcfi")?(i=(e=s.split("#"))[0],{cfi:e.length>1&&e[1],href:s,packageUrl:i,page:a}):{href:s,page:a}}process(t){t.forEach((function(t){this.pages.push(t.page),t.cfi&&this.locations.push(t.cfi)}),this),this.firstPage=parseInt(this.pages[0]),this.lastPage=parseInt(this.pages[this.pages.length-1]),this.totalPages=this.lastPage-this.firstPage}pageFromCfi(t){var e=-1;if(0===this.locations.length)return-1;var i=Object(r.indexOfSorted)(t,this.locations,this.epubcfi.compare);return-1!=i?e=this.pages[i]:void 0!==(e=(i=Object(r.locationOf)(t,this.locations,this.epubcfi.compare))-1>=0?this.pages[i-1]:this.pages[0])||(e=-1),e}cfiFromPage(t){var e=-1;"number"!=typeof t&&(t=parseInt(t));var i=this.pages.indexOf(t);return-1!=i&&(e=this.locations[i]),e}pageFromPercentage(t){return Math.round(this.totalPages*t)}percentageFromPage(t){var e=(t-this.firstPage)/this.totalPages;return Math.round(1e3*e)/1e3}percentageFromCfi(t){var e=this.pageFromCfi(t);return this.percentageFromPage(e)}destroy(){this.pages=void 0,this.locations=void 0,this.epubcfi=void 0,this.pageList=void 0,this.toc=void 0,this.ncx=void 0}},I=i(16),R=i(29),k=i.n(R);var A=class{constructor(){this.zip=void 0,this.urlCache={},this.checkRequirements()}checkRequirements(){try{this.zip=new k.a}catch(t){throw new Error("JSZip lib not loaded")}}open(t,e){return this.zip.loadAsync(t,{base64:e})}openUrl(t,e){return u(t,"binary").then(function(t){return this.zip.loadAsync(t,{base64:e})}.bind(this))}request(t,e){var i,n=new r.defer,s=new a.a(t);return e||(e=s.extension),(i="blob"==e?this.getBlob(t):this.getText(t))?i.then(function(t){let i=this.handleResponse(t,e);n.resolve(i)}.bind(this)):n.reject({message:"File not found in the epub: "+t,stack:(new Error).stack}),n.promise}handleResponse(t,e){return"json"==e?JSON.parse(t):Object(r.isXml)(e)?Object(r.parse)(t,"text/xml"):"xhtml"==e?Object(r.parse)(t,"application/xhtml+xml"):"html"==e||"htm"==e?Object(r.parse)(t,"text/html"):t}getBlob(t,e){var i=window.decodeURIComponent(t.substr(1)),n=this.zip.file(i);if(n)return e=e||T.lookup(n.name),n.async("uint8array").then((function(t){return new Blob([t],{type:e})}))}getText(t,e){var i=window.decodeURIComponent(t.substr(1)),n=this.zip.file(i);if(n)return n.async("string").then((function(t){return t}))}getBase64(t,e){var i=window.decodeURIComponent(t.substr(1)),n=this.zip.file(i);if(n)return e=e||T.lookup(n.name),n.async("base64").then((function(t){return"data:"+e+";base64,"+t}))}createUrl(t,e){var i,n,s=new r.defer,o=window.URL||window.webkitURL||window.mozURL,a=e&&e.base64;return t in this.urlCache?(s.resolve(this.urlCache[t]),s.promise):(a?(n=this.getBase64(t))&&n.then(function(e){this.urlCache[t]=e,s.resolve(e)}.bind(this)):(n=this.getBlob(t))&&n.then(function(e){i=o.createObjectURL(e),this.urlCache[t]=i,s.resolve(i)}.bind(this)),n||s.reject({message:"File not found in the epub: "+t,stack:(new Error).stack}),s.promise)}revokeUrl(t){var e=window.URL||window.webkitURL||window.mozURL,i=this.urlCache[t];i&&e.revokeObjectURL(i)}destroy(){var t=window.URL||window.webkitURL||window.mozURL;for(let e in this.urlCache)t.revokeObjectURL(e);this.zip=void 0,this.urlCache={}}},L=i(23),j=i.n(L);class D{constructor(t,e,i){this.urlCache={},this.storage=void 0,this.name=t,this.requester=e||u,this.resolver=i,this.online=!0,this.checkRequirements(),this.addListeners()}checkRequirements(){try{let t;void 0===j.a&&(t=j.a),this.storage=t.createInstance({name:this.name})}catch(t){throw new Error("localForage lib not loaded")}}addListeners(){this._status=this.status.bind(this),window.addEventListener("online",this._status),window.addEventListener("offline",this._status)}removeListeners(){window.removeEventListener("online",this._status),window.removeEventListener("offline",this._status),this._status=void 0}status(t){let e=navigator.onLine;this.online=e,e?this.emit("online",this):this.emit("offline",this)}add(t,e){let i=t.resources.map(t=>{let{href:i}=t,n=this.resolver(i),s=window.encodeURIComponent(n);return this.storage.getItem(s).then(t=>!t||e?this.requester(n,"binary").then(t=>this.storage.setItem(s,t)):t)});return Promise.all(i)}put(t,e,i){let n=window.encodeURIComponent(t);return this.storage.getItem(n).then(s=>s||this.requester(t,"binary",e,i).then(t=>this.storage.setItem(n,t)))}request(t,e,i,n){return this.online?this.requester(t,e,i,n).then(e=>(this.put(t),e)):this.retrieve(t,e)}retrieve(t,e){new r.defer;var i=new a.a(t);return e||(e=i.extension),("blob"==e?this.getBlob(t):this.getText(t)).then(i=>{var n,s=new r.defer;return i?(n=this.handleResponse(i,e),s.resolve(n)):s.reject({message:"File not found in storage: "+t,stack:(new Error).stack}),s.promise})}handleResponse(t,e){return"json"==e?JSON.parse(t):Object(r.isXml)(e)?Object(r.parse)(t,"text/xml"):"xhtml"==e?Object(r.parse)(t,"application/xhtml+xml"):"html"==e||"htm"==e?Object(r.parse)(t,"text/html"):t}getBlob(t,e){let i=window.encodeURIComponent(t);return this.storage.getItem(i).then((function(i){if(i)return e=e||T.lookup(t),new Blob([i],{type:e})}))}getText(t,e){let i=window.encodeURIComponent(t);return e=e||T.lookup(t),this.storage.getItem(i).then((function(t){var i,n=new r.defer,s=new FileReader;if(t)return i=new Blob([t],{type:e}),s.addEventListener("loadend",()=>{n.resolve(s.result)}),s.readAsText(i,e),n.promise}))}getBase64(t,e){let i=window.encodeURIComponent(t);return e=e||T.lookup(t),this.storage.getItem(i).then(t=>{var i,n=new r.defer,s=new FileReader;if(t)return i=new Blob([t],{type:e}),s.addEventListener("loadend",()=>{n.resolve(s.result)}),s.readAsDataURL(i,e),n.promise})}createUrl(t,e){var i,n,s=new r.defer,o=window.URL||window.webkitURL||window.mozURL,a=e&&e.base64;return t in this.urlCache?(s.resolve(this.urlCache[t]),s.promise):(a?(n=this.getBase64(t))&&n.then(function(e){this.urlCache[t]=e,s.resolve(e)}.bind(this)):(n=this.getBlob(t))&&n.then(function(e){i=o.createObjectURL(e),this.urlCache[t]=i,s.resolve(i)}.bind(this)),n||s.reject({message:"File not found in storage: "+t,stack:(new Error).stack}),s.promise)}revokeUrl(t){var e=window.URL||window.webkitURL||window.mozURL,i=this.urlCache[t];i&&e.revokeObjectURL(i)}destroy(){var t=window.URL||window.webkitURL||window.mozURL;for(let e in this.urlCache)t.revokeObjectURL(e);this.urlCache={},this.removeListeners()}}s()(D.prototype);var P=D;var M=class{constructor(t){this.interactive="",this.fixedLayout="",this.openToSpread="",this.orientationLock="",t&&this.parse(t)}parse(t){if(!t)return this;const e=Object(r.qs)(t,"display_options");if(!e)return this;return Object(r.qsa)(e,"option").forEach(t=>{let e="";switch(t.childNodes.length&&(e=t.childNodes[0].nodeValue),t.attributes.name.value){case"interactive":this.interactive=e;break;case"fixed-layout":this.fixedLayout=e;break;case"open-to-spread":this.openToSpread=e;break;case"orientation-lock":this.orientationLock=e}}),this}destroy(){this.interactive=void 0,this.fixedLayout=void 0,this.openToSpread=void 0,this.orientationLock=void 0}};const z="binary",B="base64",q="epub",F="opf",U="json",W="directory";class H{constructor(t,e){void 0===e&&"string"!=typeof t&&t instanceof Blob==!1&&t instanceof ArrayBuffer==!1&&(e=t,t=void 0),this.settings=Object(r.extend)(this.settings||{},{requestMethod:void 0,requestCredentials:void 0,requestHeaders:void 0,encoding:void 0,replacements:void 0,canonical:void 0,openAs:void 0,store:void 0}),Object(r.extend)(this.settings,e),this.opening=new r.defer,this.opened=this.opening.promise,this.isOpen=!1,this.loading={manifest:new r.defer,spine:new r.defer,metadata:new r.defer,cover:new r.defer,navigation:new r.defer,pageList:new r.defer,resources:new r.defer,displayOptions:new r.defer},this.loaded={manifest:this.loading.manifest.promise,spine:this.loading.spine.promise,metadata:this.loading.metadata.promise,cover:this.loading.cover.promise,navigation:this.loading.navigation.promise,pageList:this.loading.pageList.promise,resources:this.loading.resources.promise,displayOptions:this.loading.displayOptions.promise},this.ready=Promise.all([this.loaded.manifest,this.loaded.spine,this.loaded.metadata,this.loaded.cover,this.loaded.navigation,this.loaded.resources,this.loaded.displayOptions]),this.isRendered=!1,this.request=this.settings.requestMethod||u,this.spine=new p,this.locations=new y(this.spine,this.load.bind(this)),this.navigation=void 0,this.pageList=void 0,this.url=void 0,this.path=void 0,this.archived=!1,this.archive=void 0,this.storage=void 0,this.resources=void 0,this.rendition=void 0,this.container=void 0,this.packaging=void 0,this.displayOptions=void 0,this.settings.store&&this.store(this.settings.store),t&&this.open(t,this.settings.openAs).catch(e=>{var i=new Error("Cannot load book at "+t);this.emit(m.c.BOOK.OPEN_FAILED,i)})}open(t,e){var i,n=e||this.determineType(t);return n===z?(this.archived=!0,this.url=new o.a("/",""),i=this.openEpub(t)):n===B?(this.archived=!0,this.url=new o.a("/",""),i=this.openEpub(t,n)):n===q?(this.archived=!0,this.url=new o.a("/",""),i=this.request(t,"binary",this.settings.requestCredentials,this.settings.requestHeaders).then(this.openEpub.bind(this))):n==F?(this.url=new o.a(t),i=this.openPackaging(this.url.Path.toString())):n==U?(this.url=new o.a(t),i=this.openManifest(this.url.Path.toString())):(this.url=new o.a(t),i=this.openContainer("META-INF/container.xml").then(this.openPackaging.bind(this))),i}openEpub(t,e){return this.unarchive(t,e||this.settings.encoding).then(()=>this.openContainer("META-INF/container.xml")).then(t=>this.openPackaging(t))}openContainer(t){return this.load(t).then(t=>(this.container=new x(t),this.resolve(this.container.packagePath)))}openPackaging(t){return this.path=new a.a(t),this.load(t).then(t=>(this.packaging=new E(t),this.unpack(this.packaging)))}openManifest(t){return this.path=new a.a(t),this.load(t).then(t=>(this.packaging=new E,this.packaging.load(t),this.unpack(this.packaging)))}load(t){var e=this.resolve(t);return this.archived?this.archive.request(e):this.request(e,null,this.settings.requestCredentials,this.settings.requestHeaders)}resolve(t,e){if(t){var i=t;return t.indexOf("://")>-1?t:(this.path&&(i=this.path.resolve(t)),0!=e&&this.url&&(i=this.url.resolve(i)),i)}}canonical(t){return t?this.settings.canonical?this.settings.canonical(t):this.resolve(t,!0):""}determineType(t){var e;return"base64"===this.settings.encoding?B:"string"!=typeof t?z:((e=new o.a(t).path().extension)&&(e=e.replace(/\\?.*$/,"")),e?"epub"===e?q:"opf"===e?F:"json"===e?U:void 0:W)}unpack(t){this.package=t,""===this.packaging.metadata.layout?this.load(this.url.resolve("META-INF/com.apple.ibooks.display-options.xml")).then(t=>{this.displayOptions=new M(t),this.loading.displayOptions.resolve(this.displayOptions)}).catch(t=>{this.displayOptions=new M,this.loading.displayOptions.resolve(this.displayOptions)}):(this.displayOptions=new M,this.loading.displayOptions.resolve(this.displayOptions)),this.spine.unpack(this.packaging,this.resolve.bind(this),this.canonical.bind(this)),this.resources=new C(this.packaging.manifest,{archive:this.archive,resolver:this.resolve.bind(this),request:this.request.bind(this),replacements:this.settings.replacements||(this.archived?"blobUrl":"base64")}),this.loadNavigation(this.packaging).then(()=>{this.loading.navigation.resolve(this.navigation)}),this.packaging.coverPath&&(this.cover=this.resolve(this.packaging.coverPath)),this.loading.manifest.resolve(this.packaging.manifest),this.loading.metadata.resolve(this.packaging.metadata),this.loading.spine.resolve(this.spine),this.loading.cover.resolve(this.cover),this.loading.resources.resolve(this.resources),this.loading.pageList.resolve(this.pageList),this.isOpen=!0,this.archived||this.settings.replacements&&"none"!=this.settings.replacements?this.replacements().then(()=>{this.loaded.displayOptions.then(()=>{this.opening.resolve(this)})}).catch(t=>{console.error(t)}):this.loaded.displayOptions.then(()=>{this.opening.resolve(this)})}loadNavigation(t){let e=t.navPath||t.ncxPath,i=t.toc;return i?new Promise((e,n)=>{this.navigation=new S(i),t.pageList&&(this.pageList=new O(t.pageList)),e(this.navigation)}):e?this.load(e,"xml").then(t=>(this.navigation=new S(t),this.pageList=new O(t),this.navigation)):new Promise((t,e)=>{this.navigation=new S,this.pageList=new O,t(this.navigation)})}section(t){return this.spine.get(t)}renderTo(t,e){return this.rendition=new I.a(this,e),this.rendition.attachTo(t),this.rendition}setRequestCredentials(t){this.settings.requestCredentials=t}setRequestHeaders(t){this.settings.requestHeaders=t}unarchive(t,e){return this.archive=new A,this.archive.open(t,e)}store(t){let e=this.settings.replacements&&"none"!==this.settings.replacements,i=this.url,n=this.settings.requestMethod||u.bind(this);return this.storage=new P(t,n,this.resolve.bind(this)),this.request=this.storage.request.bind(this.storage),this.opened.then(()=>{this.archived&&(this.storage.requester=this.archive.request.bind(this.archive));let t=(t,e)=>{e.output=this.resources.substitute(t,e.url)};this.resources.settings.replacements=e||"blobUrl",this.resources.replacements().then(()=>this.resources.replaceCss()),this.storage.on("offline",()=>{this.url=new o.a("/",""),this.spine.hooks.serialize.register(t)}),this.storage.on("online",()=>{this.url=i,this.spine.hooks.serialize.deregister(t)})}),this.storage}coverUrl(){return this.loaded.cover.then(()=>this.cover?this.archived?this.archive.createUrl(this.cover):this.cover:null)}replacements(){return this.spine.hooks.serialize.register((t,e)=>{e.output=this.resources.substitute(t,e.url)}),this.resources.replacements().then(()=>this.resources.replaceCss())}getRange(t){var e=new h.a(t),i=this.spine.get(e.spinePos),n=this.load.bind(this);return i?i.load(n).then((function(t){return e.toRange(i.document)})):new Promise((t,e)=>{e("CFI could not be found")})}key(t){var e=t||this.packaging.metadata.identifier||this.url.filename;return\`epubjs:\${m.b}:\${e}\`}destroy(){this.opened=void 0,this.loading=void 0,this.loaded=void 0,this.ready=void 0,this.isOpen=!1,this.isRendered=!1,this.spine&&this.spine.destroy(),this.locations&&this.locations.destroy(),this.pageList&&this.pageList.destroy(),this.archive&&this.archive.destroy(),this.resources&&this.resources.destroy(),this.container&&this.container.destroy(),this.packaging&&this.packaging.destroy(),this.rendition&&this.rendition.destroy(),this.displayOptions&&this.displayOptions.destroy(),this.spine=void 0,this.locations=void 0,this.pageList=void 0,this.archive=void 0,this.resources=void 0,this.container=void 0,this.packaging=void 0,this.rendition=void 0,this.navigation=void 0,this.url=void 0,this.path=void 0,this.archived=!1}}s()(H.prototype);e.a=H},function(t,e,i){var n=i(14).NAMESPACE;function s(t){return""!==t}function r(t,e){return t.hasOwnProperty(e)||(t[e]=!0),t}function o(t){if(!t)return[];var e=function(t){return t?t.split(/[\\t\\n\\f\\r ]+/).filter(s):[]}(t);return Object.keys(e.reduce(r,{}))}function a(t,e){for(var i in t)e[i]=t[i]}function h(t,e){var i=t.prototype;if(!(i instanceof e)){function n(){}n.prototype=e.prototype,a(i,n=new n),t.prototype=i=n}i.constructor!=t&&("function"!=typeof t&&console.error("unknown Class:"+t),i.constructor=t)}var l={},c=l.ELEMENT_NODE=1,u=l.ATTRIBUTE_NODE=2,d=l.TEXT_NODE=3,f=l.CDATA_SECTION_NODE=4,p=l.ENTITY_REFERENCE_NODE=5,g=l.ENTITY_NODE=6,m=l.PROCESSING_INSTRUCTION_NODE=7,v=l.COMMENT_NODE=8,y=l.DOCUMENT_NODE=9,b=l.DOCUMENT_TYPE_NODE=10,w=l.DOCUMENT_FRAGMENT_NODE=11,x=l.NOTATION_NODE=12,E={},S={},N=(E.INDEX_SIZE_ERR=(S[1]="Index size error",1),E.DOMSTRING_SIZE_ERR=(S[2]="DOMString size error",2),E.HIERARCHY_REQUEST_ERR=(S[3]="Hierarchy request error",3)),_=(E.WRONG_DOCUMENT_ERR=(S[4]="Wrong document",4),E.INVALID_CHARACTER_ERR=(S[5]="Invalid character",5),E.NO_DATA_ALLOWED_ERR=(S[6]="No data allowed",6),E.NO_MODIFICATION_ALLOWED_ERR=(S[7]="No modification allowed",7),E.NOT_FOUND_ERR=(S[8]="Not found",8)),T=(E.NOT_SUPPORTED_ERR=(S[9]="Not supported",9),E.INUSE_ATTRIBUTE_ERR=(S[10]="Attribute in use",10));E.INVALID_STATE_ERR=(S[11]="Invalid state",11),E.SYNTAX_ERR=(S[12]="Syntax error",12),E.INVALID_MODIFICATION_ERR=(S[13]="Invalid modification",13),E.NAMESPACE_ERR=(S[14]="Invalid namespace",14),E.INVALID_ACCESS_ERR=(S[15]="Invalid access",15);function C(t,e){if(e instanceof Error)var i=e;else i=this,Error.call(this,S[t]),this.message=S[t],Error.captureStackTrace&&Error.captureStackTrace(this,C);return i.code=t,e&&(this.message=this.message+": "+e),i}function O(){}function I(t,e){this._node=t,this._refresh=e,R(this)}function R(t){var e=t._node._inc||t._node.ownerDocument._inc;if(t._inc!=e){var i=t._refresh(t._node);at(t,"length",i.length),a(i,t),t._inc=e}}function k(){}function A(t,e){for(var i=t.length;i--;)if(t[i]===e)return i}function L(t,e,i,s){if(s?e[A(e,s)]=i:e[e.length++]=i,t){i.ownerElement=t;var r=t.ownerDocument;r&&(s&&q(r,t,s),function(t,e,i){t&&t._inc++,i.namespaceURI===n.XMLNS&&(e._nsMap[i.prefix?i.localName:""]=i.value)}(r,t,i))}}function j(t,e,i){var n=A(e,i);if(!(n>=0))throw C(_,new Error(t.tagName+"@"+i));for(var s=e.length-1;n<s;)e[n]=e[++n];if(e.length=s,t){var r=t.ownerDocument;r&&(q(r,t,i),i.ownerElement=null)}}function D(){}function P(){}function M(t){return("<"==t?"&lt;":">"==t&&"&gt;")||"&"==t&&"&amp;"||'"'==t&&"&quot;"||"&#"+t.charCodeAt()+";"}function z(t,e){if(e(t))return!0;if(t=t.firstChild)do{if(z(t,e))return!0}while(t=t.nextSibling)}function B(){}function q(t,e,i,s){t&&t._inc++,i.namespaceURI===n.XMLNS&&delete e._nsMap[i.prefix?i.localName:""]}function F(t,e,i){if(t&&t._inc){t._inc++;var n=e.childNodes;if(i)n[n.length++]=i;else{for(var s=e.firstChild,r=0;s;)n[r++]=s,s=s.nextSibling;n.length=r}}}function U(t,e){var i=e.previousSibling,n=e.nextSibling;return i?i.nextSibling=n:t.firstChild=n,n?n.previousSibling=i:t.lastChild=i,F(t.ownerDocument,t),e}function W(t,e,i){var n=e.parentNode;if(n&&n.removeChild(e),e.nodeType===w){var s=e.firstChild;if(null==s)return e;var r=e.lastChild}else s=r=e;var o=i?i.previousSibling:t.lastChild;s.previousSibling=o,r.nextSibling=i,o?o.nextSibling=s:t.firstChild=s,null==i?t.lastChild=r:i.previousSibling=r;do{s.parentNode=t}while(s!==r&&(s=s.nextSibling));return F(t.ownerDocument||t,t),e.nodeType==w&&(e.firstChild=e.lastChild=null),e}function H(){this._nsMap={}}function V(){}function X(){}function G(){}function Y(){}function $(){}function K(){}function Z(){}function J(){}function Q(){}function tt(){}function et(){}function it(){}function nt(t,e){var i=[],n=9==this.nodeType&&this.documentElement||this,s=n.prefix,r=n.namespaceURI;if(r&&null==s&&null==(s=n.lookupPrefix(r)))var o=[{namespace:r,prefix:null}];return ot(this,i,t,e,o),i.join("")}function st(t,e,i){var s=t.prefix||"",r=t.namespaceURI;if(!r)return!1;if("xml"===s&&r===n.XML||r===n.XMLNS)return!1;for(var o=i.length;o--;){var a=i[o];if(a.prefix===s)return a.namespace!==r}return!0}function rt(t,e,i){t.push(" ",e,'="',i.replace(/[<&"]/g,M),'"')}function ot(t,e,i,s,r){if(r||(r=[]),s){if(!(t=s(t)))return;if("string"==typeof t)return void e.push(t)}switch(t.nodeType){case c:var o=t.attributes,a=o.length,h=t.firstChild,l=t.tagName,g=l;if(!(i=n.isHTML(t.namespaceURI)||i)&&!t.prefix&&t.namespaceURI){for(var x,E=0;E<o.length;E++)if("xmlns"===o.item(E).name){x=o.item(E).value;break}if(!x)for(var S=r.length-1;S>=0;S--){if(""===(N=r[S]).prefix&&N.namespace===t.namespaceURI){x=N.namespace;break}}if(x!==t.namespaceURI)for(S=r.length-1;S>=0;S--){var N;if((N=r[S]).namespace===t.namespaceURI){N.prefix&&(g=N.prefix+":"+l);break}}}e.push("<",g);for(var _=0;_<a;_++){"xmlns"==(T=o.item(_)).prefix?r.push({prefix:T.localName,namespace:T.value}):"xmlns"==T.nodeName&&r.push({prefix:"",namespace:T.value})}for(_=0;_<a;_++){var T,C,O;if(st(T=o.item(_),0,r))rt(e,(C=T.prefix||"")?"xmlns:"+C:"xmlns",O=T.namespaceURI),r.push({prefix:C,namespace:O});ot(T,e,i,s,r)}if(l===g&&st(t,0,r))rt(e,(C=t.prefix||"")?"xmlns:"+C:"xmlns",O=t.namespaceURI),r.push({prefix:C,namespace:O});if(h||i&&!/^(?:meta|link|img|br|hr|input)$/i.test(l)){if(e.push(">"),i&&/^script$/i.test(l))for(;h;)h.data?e.push(h.data):ot(h,e,i,s,r.slice()),h=h.nextSibling;else for(;h;)ot(h,e,i,s,r.slice()),h=h.nextSibling;e.push("</",g,">")}else e.push("/>");return;case y:case w:for(h=t.firstChild;h;)ot(h,e,i,s,r.slice()),h=h.nextSibling;return;case u:return rt(e,t.name,t.value);case d:return e.push(t.data.replace(/[<&]/g,M).replace(/]]>/g,"]]&gt;"));case f:return e.push("<![CDATA[",t.data,"]]>");case v:return e.push("\\x3c!--",t.data,"--\\x3e");case b:var I=t.publicId,R=t.systemId;if(e.push("<!DOCTYPE ",t.name),I)e.push(" PUBLIC ",I),R&&"."!=R&&e.push(" ",R),e.push(">");else if(R&&"."!=R)e.push(" SYSTEM ",R,">");else{var k=t.internalSubset;k&&e.push(" [",k,"]"),e.push(">")}return;case m:return e.push("<?",t.target," ",t.data,"?>");case p:return e.push("&",t.nodeName,";");default:e.push("??",t.nodeName)}}function at(t,e,i){t[e]=i}C.prototype=Error.prototype,a(E,C),O.prototype={length:0,item:function(t){return this[t]||null},toString:function(t,e){for(var i=[],n=0;n<this.length;n++)ot(this[n],i,t,e);return i.join("")}},I.prototype.item=function(t){return R(this),this[t]},h(I,O),k.prototype={length:0,item:O.prototype.item,getNamedItem:function(t){for(var e=this.length;e--;){var i=this[e];if(i.nodeName==t)return i}},setNamedItem:function(t){var e=t.ownerElement;if(e&&e!=this._ownerElement)throw new C(T);var i=this.getNamedItem(t.nodeName);return L(this._ownerElement,this,t,i),i},setNamedItemNS:function(t){var e,i=t.ownerElement;if(i&&i!=this._ownerElement)throw new C(T);return e=this.getNamedItemNS(t.namespaceURI,t.localName),L(this._ownerElement,this,t,e),e},removeNamedItem:function(t){var e=this.getNamedItem(t);return j(this._ownerElement,this,e),e},removeNamedItemNS:function(t,e){var i=this.getNamedItemNS(t,e);return j(this._ownerElement,this,i),i},getNamedItemNS:function(t,e){for(var i=this.length;i--;){var n=this[i];if(n.localName==e&&n.namespaceURI==t)return n}return null}},D.prototype={hasFeature:function(t,e){return!0},createDocument:function(t,e,i){var n=new B;if(n.implementation=this,n.childNodes=new O,n.doctype=i||null,i&&n.appendChild(i),e){var s=n.createElementNS(t,e);n.appendChild(s)}return n},createDocumentType:function(t,e,i){var n=new K;return n.name=t,n.nodeName=t,n.publicId=e||"",n.systemId=i||"",n}},P.prototype={firstChild:null,lastChild:null,previousSibling:null,nextSibling:null,attributes:null,parentNode:null,childNodes:null,ownerDocument:null,nodeValue:null,namespaceURI:null,prefix:null,localName:null,insertBefore:function(t,e){return W(this,t,e)},replaceChild:function(t,e){this.insertBefore(t,e),e&&this.removeChild(e)},removeChild:function(t){return U(this,t)},appendChild:function(t){return this.insertBefore(t,null)},hasChildNodes:function(){return null!=this.firstChild},cloneNode:function(t){return function t(e,i,n){var s=new i.constructor;for(var r in i){var o=i[r];"object"!=typeof o&&o!=s[r]&&(s[r]=o)}i.childNodes&&(s.childNodes=new O);switch(s.ownerDocument=e,s.nodeType){case c:var a=i.attributes,h=s.attributes=new k,l=a.length;h._ownerElement=s;for(var d=0;d<l;d++)s.setAttributeNode(t(e,a.item(d),!0));break;case u:n=!0}if(n)for(var f=i.firstChild;f;)s.appendChild(t(e,f,n)),f=f.nextSibling;return s}(this.ownerDocument||this,this,t)},normalize:function(){for(var t=this.firstChild;t;){var e=t.nextSibling;e&&e.nodeType==d&&t.nodeType==d?(this.removeChild(e),t.appendData(e.data)):(t.normalize(),t=e)}},isSupported:function(t,e){return this.ownerDocument.implementation.hasFeature(t,e)},hasAttributes:function(){return this.attributes.length>0},lookupPrefix:function(t){for(var e=this;e;){var i=e._nsMap;if(i)for(var n in i)if(i[n]==t)return n;e=e.nodeType==u?e.ownerDocument:e.parentNode}return null},lookupNamespaceURI:function(t){for(var e=this;e;){var i=e._nsMap;if(i&&t in i)return i[t];e=e.nodeType==u?e.ownerDocument:e.parentNode}return null},isDefaultNamespace:function(t){return null==this.lookupPrefix(t)}},a(l,P),a(l,P.prototype),B.prototype={nodeName:"#document",nodeType:y,doctype:null,documentElement:null,_inc:1,insertBefore:function(t,e){if(t.nodeType==w){for(var i=t.firstChild;i;){var n=i.nextSibling;this.insertBefore(i,e),i=n}return t}return null==this.documentElement&&t.nodeType==c&&(this.documentElement=t),W(this,t,e),t.ownerDocument=this,t},removeChild:function(t){return this.documentElement==t&&(this.documentElement=null),U(this,t)},importNode:function(t,e){return function t(e,i,n){var s;switch(i.nodeType){case c:(s=i.cloneNode(!1)).ownerDocument=e;case w:break;case u:n=!0}s||(s=i.cloneNode(!1));if(s.ownerDocument=e,s.parentNode=null,n)for(var r=i.firstChild;r;)s.appendChild(t(e,r,n)),r=r.nextSibling;return s}(this,t,e)},getElementById:function(t){var e=null;return z(this.documentElement,(function(i){if(i.nodeType==c&&i.getAttribute("id")==t)return e=i,!0})),e},getElementsByClassName:function(t){var e=o(t);return new I(this,(function(i){var n=[];return e.length>0&&z(i.documentElement,(function(s){if(s!==i&&s.nodeType===c){var r=s.getAttribute("class");if(r){var a=t===r;if(!a){var h=o(r);a=e.every((l=h,function(t){return l&&-1!==l.indexOf(t)}))}a&&n.push(s)}}var l})),n}))},createElement:function(t){var e=new H;return e.ownerDocument=this,e.nodeName=t,e.tagName=t,e.localName=t,e.childNodes=new O,(e.attributes=new k)._ownerElement=e,e},createDocumentFragment:function(){var t=new tt;return t.ownerDocument=this,t.childNodes=new O,t},createTextNode:function(t){var e=new G;return e.ownerDocument=this,e.appendData(t),e},createComment:function(t){var e=new Y;return e.ownerDocument=this,e.appendData(t),e},createCDATASection:function(t){var e=new $;return e.ownerDocument=this,e.appendData(t),e},createProcessingInstruction:function(t,e){var i=new et;return i.ownerDocument=this,i.tagName=i.target=t,i.nodeValue=i.data=e,i},createAttribute:function(t){var e=new V;return e.ownerDocument=this,e.name=t,e.nodeName=t,e.localName=t,e.specified=!0,e},createEntityReference:function(t){var e=new Q;return e.ownerDocument=this,e.nodeName=t,e},createElementNS:function(t,e){var i=new H,n=e.split(":"),s=i.attributes=new k;return i.childNodes=new O,i.ownerDocument=this,i.nodeName=e,i.tagName=e,i.namespaceURI=t,2==n.length?(i.prefix=n[0],i.localName=n[1]):i.localName=e,s._ownerElement=i,i},createAttributeNS:function(t,e){var i=new V,n=e.split(":");return i.ownerDocument=this,i.nodeName=e,i.name=e,i.namespaceURI=t,i.specified=!0,2==n.length?(i.prefix=n[0],i.localName=n[1]):i.localName=e,i}},h(B,P),H.prototype={nodeType:c,hasAttribute:function(t){return null!=this.getAttributeNode(t)},getAttribute:function(t){var e=this.getAttributeNode(t);return e&&e.value||""},getAttributeNode:function(t){return this.attributes.getNamedItem(t)},setAttribute:function(t,e){var i=this.ownerDocument.createAttribute(t);i.value=i.nodeValue=""+e,this.setAttributeNode(i)},removeAttribute:function(t){var e=this.getAttributeNode(t);e&&this.removeAttributeNode(e)},appendChild:function(t){return t.nodeType===w?this.insertBefore(t,null):function(t,e){var i=e.parentNode;if(i){var n=t.lastChild;i.removeChild(e);n=t.lastChild}return n=t.lastChild,e.parentNode=t,e.previousSibling=n,e.nextSibling=null,n?n.nextSibling=e:t.firstChild=e,t.lastChild=e,F(t.ownerDocument,t,e),e}(this,t)},setAttributeNode:function(t){return this.attributes.setNamedItem(t)},setAttributeNodeNS:function(t){return this.attributes.setNamedItemNS(t)},removeAttributeNode:function(t){return this.attributes.removeNamedItem(t.nodeName)},removeAttributeNS:function(t,e){var i=this.getAttributeNodeNS(t,e);i&&this.removeAttributeNode(i)},hasAttributeNS:function(t,e){return null!=this.getAttributeNodeNS(t,e)},getAttributeNS:function(t,e){var i=this.getAttributeNodeNS(t,e);return i&&i.value||""},setAttributeNS:function(t,e,i){var n=this.ownerDocument.createAttributeNS(t,e);n.value=n.nodeValue=""+i,this.setAttributeNode(n)},getAttributeNodeNS:function(t,e){return this.attributes.getNamedItemNS(t,e)},getElementsByTagName:function(t){return new I(this,(function(e){var i=[];return z(e,(function(n){n===e||n.nodeType!=c||"*"!==t&&n.tagName!=t||i.push(n)})),i}))},getElementsByTagNameNS:function(t,e){return new I(this,(function(i){var n=[];return z(i,(function(s){s===i||s.nodeType!==c||"*"!==t&&s.namespaceURI!==t||"*"!==e&&s.localName!=e||n.push(s)})),n}))}},B.prototype.getElementsByTagName=H.prototype.getElementsByTagName,B.prototype.getElementsByTagNameNS=H.prototype.getElementsByTagNameNS,h(H,P),V.prototype.nodeType=u,h(V,P),X.prototype={data:"",substringData:function(t,e){return this.data.substring(t,t+e)},appendData:function(t){t=this.data+t,this.nodeValue=this.data=t,this.length=t.length},insertData:function(t,e){this.replaceData(t,0,e)},appendChild:function(t){throw new Error(S[N])},deleteData:function(t,e){this.replaceData(t,e,"")},replaceData:function(t,e,i){i=this.data.substring(0,t)+i+this.data.substring(t+e),this.nodeValue=this.data=i,this.length=i.length}},h(X,P),G.prototype={nodeName:"#text",nodeType:d,splitText:function(t){var e=this.data,i=e.substring(t);e=e.substring(0,t),this.data=this.nodeValue=e,this.length=e.length;var n=this.ownerDocument.createTextNode(i);return this.parentNode&&this.parentNode.insertBefore(n,this.nextSibling),n}},h(G,X),Y.prototype={nodeName:"#comment",nodeType:v},h(Y,X),$.prototype={nodeName:"#cdata-section",nodeType:f},h($,X),K.prototype.nodeType=b,h(K,P),Z.prototype.nodeType=x,h(Z,P),J.prototype.nodeType=g,h(J,P),Q.prototype.nodeType=p,h(Q,P),tt.prototype.nodeName="#document-fragment",tt.prototype.nodeType=w,h(tt,P),et.prototype.nodeType=m,h(et,P),it.prototype.serializeToString=function(t,e,i){return nt.call(t,e,i)},P.prototype.toString=nt;try{if(Object.defineProperty){Object.defineProperty(I.prototype,"length",{get:function(){return R(this),this.$$length}}),Object.defineProperty(P.prototype,"textContent",{get:function(){return function t(e){switch(e.nodeType){case c:case w:var i=[];for(e=e.firstChild;e;)7!==e.nodeType&&8!==e.nodeType&&i.push(t(e)),e=e.nextSibling;return i.join("");default:return e.nodeValue}}(this)},set:function(t){switch(this.nodeType){case c:case w:for(;this.firstChild;)this.removeChild(this.firstChild);(t||String(t))&&this.appendChild(this.ownerDocument.createTextNode(t));break;default:this.data=t,this.value=t,this.nodeValue=t}}}),at=function(t,e,i){t["$$"+e]=i}}}catch(t){}e.DocumentType=K,e.DOMException=C,e.DOMImplementation=D,e.Element=H,e.Node=P,e.NodeList=O,e.XMLSerializer=it},function(t,e,i){var n=i(52),s="object"==typeof self&&self&&self.Object===Object&&self,r=n||s||Function("return this")();t.exports=r},function(t,e,i){var n=i(26).Symbol;t.exports=n},function(t,e,i){var n=i(21),s=i(19);t.exports=function(t,e,i){var r=!0,o=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return s(i)&&(r="leading"in i?!!i.leading:r,o="trailing"in i?!!i.trailing:o),n(t,e,{leading:r,maxWait:e,trailing:o})}},function(e,i){e.exports=t},function(t,e,i){"use strict";i.r(e),function(t){var n=i(24),s=i(16),r=i(2),o=i(12),a=i(0),h=i(1);i(20),i(10),i(22);function l(t,e){return new n.a(t,e)}l.VERSION=h.b,void 0!==t&&(t.EPUBJS_VERSION=h.b),l.Book=n.a,l.Rendition=s.a,l.Contents=o.a,l.CFI=r.a,l.utils=a,e.default=l}.call(this,i(17))},function(t,e,i){"use strict";var n=i(32),s=i(40),r=i(41),o=i(42);(t.exports=function(t,e){var i,r,a,h,l;return arguments.length<2||"string"!=typeof t?(h=e,e=t,t=null):h=arguments[2],null==t?(i=a=!0,r=!1):(i=o.call(t,"c"),r=o.call(t,"e"),a=o.call(t,"w")),l={value:e,configurable:i,enumerable:r,writable:a},h?n(s(h),l):l}).gs=function(t,e,i){var a,h,l,c;return"string"!=typeof t?(l=i,i=e,e=t,t=null):l=arguments[3],null==e?e=void 0:r(e)?null==i?i=void 0:r(i)||(l=i,i=void 0):(l=e,e=i=void 0),null==t?(a=!0,h=!1):(a=o.call(t,"c"),h=o.call(t,"e")),c={get:e,set:i,configurable:a,enumerable:h},l?n(s(l),c):c}},function(t,e,i){"use strict";t.exports=i(33)()?Object.assign:i(34)},function(t,e,i){"use strict";t.exports=function(){var t,e=Object.assign;return"function"==typeof e&&(e(t={foo:"raz"},{bar:"dwa"},{trzy:"trzy"}),t.foo+t.bar+t.trzy==="razdwatrzy")}},function(t,e,i){"use strict";var n=i(35),s=i(39),r=Math.max;t.exports=function(t,e){var i,o,a,h=r(arguments.length,2);for(t=Object(s(t)),a=function(n){try{t[n]=e[n]}catch(t){i||(i=t)}},o=1;o<h;++o)n(e=arguments[o]).forEach(a);if(void 0!==i)throw i;return t}},function(t,e,i){"use strict";t.exports=i(36)()?Object.keys:i(37)},function(t,e,i){"use strict";t.exports=function(){try{return Object.keys("primitive"),!0}catch(t){return!1}}},function(t,e,i){"use strict";var n=i(18),s=Object.keys;t.exports=function(t){return s(n(t)?Object(t):t)}},function(t,e,i){"use strict";t.exports=function(){}},function(t,e,i){"use strict";var n=i(18);t.exports=function(t){if(!n(t))throw new TypeError("Cannot use null or undefined");return t}},function(t,e,i){"use strict";var n=i(18),s=Array.prototype.forEach,r=Object.create,o=function(t,e){var i;for(i in t)e[i]=t[i]};t.exports=function(t){var e=r(null);return s.call(arguments,(function(t){n(t)&&o(Object(t),e)})),e}},function(t,e,i){"use strict";t.exports=function(t){return"function"==typeof t}},function(t,e,i){"use strict";t.exports=i(43)()?String.prototype.contains:i(44)},function(t,e,i){"use strict";var n="razdwatrzy";t.exports=function(){return"function"==typeof n.contains&&(!0===n.contains("dwa")&&!1===n.contains("foo"))}},function(t,e,i){"use strict";var n=String.prototype.indexOf;t.exports=function(t){return n.call(this,t,arguments[1])>-1}},function(t,e,i){"use strict";t.exports=function(t){if("function"!=typeof t)throw new TypeError(t+" is not a function");return t}},function(t,e,i){var n=i(14),s=i(25),r=i(47),o=i(48),a=s.DOMImplementation,h=n.NAMESPACE,l=o.ParseError,c=o.XMLReader;function u(t){this.options=t||{locator:{}}}function d(){this.cdata=!1}function f(t,e){e.lineNumber=t.lineNumber,e.columnNumber=t.columnNumber}function p(t){if(t)return"\\n@"+(t.systemId||"")+"#[line:"+t.lineNumber+",col:"+t.columnNumber+"]"}function g(t,e,i){return"string"==typeof t?t.substr(e,i):t.length>=e+i||e?new java.lang.String(t,e,i)+"":t}function m(t,e){t.currentElement?t.currentElement.appendChild(e):t.doc.appendChild(e)}u.prototype.parseFromString=function(t,e){var i=this.options,n=new c,s=i.domBuilder||new d,o=i.errorHandler,a=i.locator,l=i.xmlns||{},u=/\\/x?html?$/.test(e),f=u?r.HTML_ENTITIES:r.XML_ENTITIES;return a&&s.setDocumentLocator(a),n.errorHandler=function(t,e,i){if(!t){if(e instanceof d)return e;t=e}var n={},s=t instanceof Function;function r(e){var r=t[e];!r&&s&&(r=2==t.length?function(i){t(e,i)}:t),n[e]=r&&function(t){r("[xmldom "+e+"]\\t"+t+p(i))}||function(){}}return i=i||{},r("warning"),r("error"),r("fatalError"),n}(o,s,a),n.domBuilder=i.domBuilder||s,u&&(l[""]=h.HTML),l.xml=l.xml||h.XML,t&&"string"==typeof t?n.parse(t,l,f):n.errorHandler.error("invalid doc source"),s.doc},d.prototype={startDocument:function(){this.doc=(new a).createDocument(null,null,null),this.locator&&(this.doc.documentURI=this.locator.systemId)},startElement:function(t,e,i,n){var s=this.doc,r=s.createElementNS(t,i||e),o=n.length;m(this,r),this.currentElement=r,this.locator&&f(this.locator,r);for(var a=0;a<o;a++){t=n.getURI(a);var h=n.getValue(a),l=(i=n.getQName(a),s.createAttributeNS(t,i));this.locator&&f(n.getLocator(a),l),l.value=l.nodeValue=h,r.setAttributeNode(l)}},endElement:function(t,e,i){var n=this.currentElement;n.tagName;this.currentElement=n.parentNode},startPrefixMapping:function(t,e){},endPrefixMapping:function(t){},processingInstruction:function(t,e){var i=this.doc.createProcessingInstruction(t,e);this.locator&&f(this.locator,i),m(this,i)},ignorableWhitespace:function(t,e,i){},characters:function(t,e,i){if(t=g.apply(this,arguments)){if(this.cdata)var n=this.doc.createCDATASection(t);else n=this.doc.createTextNode(t);this.currentElement?this.currentElement.appendChild(n):/^\\s*$/.test(t)&&this.doc.appendChild(n),this.locator&&f(this.locator,n)}},skippedEntity:function(t){},endDocument:function(){this.doc.normalize()},setDocumentLocator:function(t){(this.locator=t)&&(t.lineNumber=0)},comment:function(t,e,i){t=g.apply(this,arguments);var n=this.doc.createComment(t);this.locator&&f(this.locator,n),m(this,n)},startCDATA:function(){this.cdata=!0},endCDATA:function(){this.cdata=!1},startDTD:function(t,e,i){var n=this.doc.implementation;if(n&&n.createDocumentType){var s=n.createDocumentType(t,e,i);this.locator&&f(this.locator,s),m(this,s),this.doc.doctype=s}},warning:function(t){console.warn("[xmldom warning]\\t"+t,p(this.locator))},error:function(t){console.error("[xmldom error]\\t"+t,p(this.locator))},fatalError:function(t){throw new l(t,this.locator)}},"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\\w+/g,(function(t){d.prototype[t]=function(){return null}})),e.__DOMHandler=d,e.DOMParser=u,e.DOMImplementation=s.DOMImplementation,e.XMLSerializer=s.XMLSerializer},function(t,e,i){var n=i(14).freeze;e.XML_ENTITIES=n({amp:"&",apos:"'",gt:">",lt:"<",quot:'"'}),e.HTML_ENTITIES=n({lt:"<",gt:">",amp:"&",quot:'"',apos:"'",Agrave:"\xC0",Aacute:"\xC1",Acirc:"\xC2",Atilde:"\xC3",Auml:"\xC4",Aring:"\xC5",AElig:"\xC6",Ccedil:"\xC7",Egrave:"\xC8",Eacute:"\xC9",Ecirc:"\xCA",Euml:"\xCB",Igrave:"\xCC",Iacute:"\xCD",Icirc:"\xCE",Iuml:"\xCF",ETH:"\xD0",Ntilde:"\xD1",Ograve:"\xD2",Oacute:"\xD3",Ocirc:"\xD4",Otilde:"\xD5",Ouml:"\xD6",Oslash:"\xD8",Ugrave:"\xD9",Uacute:"\xDA",Ucirc:"\xDB",Uuml:"\xDC",Yacute:"\xDD",THORN:"\xDE",szlig:"\xDF",agrave:"\xE0",aacute:"\xE1",acirc:"\xE2",atilde:"\xE3",auml:"\xE4",aring:"\xE5",aelig:"\xE6",ccedil:"\xE7",egrave:"\xE8",eacute:"\xE9",ecirc:"\xEA",euml:"\xEB",igrave:"\xEC",iacute:"\xED",icirc:"\xEE",iuml:"\xEF",eth:"\xF0",ntilde:"\xF1",ograve:"\xF2",oacute:"\xF3",ocirc:"\xF4",otilde:"\xF5",ouml:"\xF6",oslash:"\xF8",ugrave:"\xF9",uacute:"\xFA",ucirc:"\xFB",uuml:"\xFC",yacute:"\xFD",thorn:"\xFE",yuml:"\xFF",nbsp:"\xA0",iexcl:"\xA1",cent:"\xA2",pound:"\xA3",curren:"\xA4",yen:"\xA5",brvbar:"\xA6",sect:"\xA7",uml:"\xA8",copy:"\xA9",ordf:"\xAA",laquo:"\xAB",not:"\xAC",shy:"\xAD\xAD",reg:"\xAE",macr:"\xAF",deg:"\xB0",plusmn:"\xB1",sup2:"\xB2",sup3:"\xB3",acute:"\xB4",micro:"\xB5",para:"\xB6",middot:"\xB7",cedil:"\xB8",sup1:"\xB9",ordm:"\xBA",raquo:"\xBB",frac14:"\xBC",frac12:"\xBD",frac34:"\xBE",iquest:"\xBF",times:"\xD7",divide:"\xF7",forall:"\u2200",part:"\u2202",exist:"\u2203",empty:"\u2205",nabla:"\u2207",isin:"\u2208",notin:"\u2209",ni:"\u220B",prod:"\u220F",sum:"\u2211",minus:"\u2212",lowast:"\u2217",radic:"\u221A",prop:"\u221D",infin:"\u221E",ang:"\u2220",and:"\u2227",or:"\u2228",cap:"\u2229",cup:"\u222A",int:"\u222B",there4:"\u2234",sim:"\u223C",cong:"\u2245",asymp:"\u2248",ne:"\u2260",equiv:"\u2261",le:"\u2264",ge:"\u2265",sub:"\u2282",sup:"\u2283",nsub:"\u2284",sube:"\u2286",supe:"\u2287",oplus:"\u2295",otimes:"\u2297",perp:"\u22A5",sdot:"\u22C5",Alpha:"\u0391",Beta:"\u0392",Gamma:"\u0393",Delta:"\u0394",Epsilon:"\u0395",Zeta:"\u0396",Eta:"\u0397",Theta:"\u0398",Iota:"\u0399",Kappa:"\u039A",Lambda:"\u039B",Mu:"\u039C",Nu:"\u039D",Xi:"\u039E",Omicron:"\u039F",Pi:"\u03A0",Rho:"\u03A1",Sigma:"\u03A3",Tau:"\u03A4",Upsilon:"\u03A5",Phi:"\u03A6",Chi:"\u03A7",Psi:"\u03A8",Omega:"\u03A9",alpha:"\u03B1",beta:"\u03B2",gamma:"\u03B3",delta:"\u03B4",epsilon:"\u03B5",zeta:"\u03B6",eta:"\u03B7",theta:"\u03B8",iota:"\u03B9",kappa:"\u03BA",lambda:"\u03BB",mu:"\u03BC",nu:"\u03BD",xi:"\u03BE",omicron:"\u03BF",pi:"\u03C0",rho:"\u03C1",sigmaf:"\u03C2",sigma:"\u03C3",tau:"\u03C4",upsilon:"\u03C5",phi:"\u03C6",chi:"\u03C7",psi:"\u03C8",omega:"\u03C9",thetasym:"\u03D1",upsih:"\u03D2",piv:"\u03D6",OElig:"\u0152",oelig:"\u0153",Scaron:"\u0160",scaron:"\u0161",Yuml:"\u0178",fnof:"\u0192",circ:"\u02C6",tilde:"\u02DC",ensp:"\u2002",emsp:"\u2003",thinsp:"\u2009",zwnj:"\u200C",zwj:"\u200D",lrm:"\u200E",rlm:"\u200F",ndash:"\u2013",mdash:"\u2014",lsquo:"\u2018",rsquo:"\u2019",sbquo:"\u201A",ldquo:"\u201C",rdquo:"\u201D",bdquo:"\u201E",dagger:"\u2020",Dagger:"\u2021",bull:"\u2022",hellip:"\u2026",permil:"\u2030",prime:"\u2032",Prime:"\u2033",lsaquo:"\u2039",rsaquo:"\u203A",oline:"\u203E",euro:"\u20AC",trade:"\u2122",larr:"\u2190",uarr:"\u2191",rarr:"\u2192",darr:"\u2193",harr:"\u2194",crarr:"\u21B5",lceil:"\u2308",rceil:"\u2309",lfloor:"\u230A",rfloor:"\u230B",loz:"\u25CA",spades:"\u2660",clubs:"\u2663",hearts:"\u2665",diams:"\u2666"}),e.entityMap=e.HTML_ENTITIES},function(t,e,i){var n=i(14).NAMESPACE,s=/[A-Z_a-z\\xC0-\\xD6\\xD8-\\xF6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD]/,r=new RegExp("[\\\\-\\\\.0-9"+s.source.slice(1,-1)+"\\\\u00B7\\\\u0300-\\\\u036F\\\\u203F-\\\\u2040]"),o=new RegExp("^"+s.source+r.source+"*(?::"+s.source+r.source+"*)?$");function a(t,e){this.message=t,this.locator=e,Error.captureStackTrace&&Error.captureStackTrace(this,a)}function h(){}function l(t,e){return e.lineNumber=t.lineNumber,e.columnNumber=t.columnNumber,e}function c(t,e,i,s,r,o){function a(t,e,n){i.attributeNames.hasOwnProperty(t)&&o.fatalError("Attribute "+t+" redefined"),i.addValue(t,e,n)}for(var h,l=++e,c=0;;){var u=t.charAt(l);switch(u){case"=":if(1===c)h=t.slice(e,l),c=3;else{if(2!==c)throw new Error("attribute equal must after attrName");c=3}break;case"'":case'"':if(3===c||1===c){if(1===c&&(o.warning('attribute value must after "="'),h=t.slice(e,l)),e=l+1,!((l=t.indexOf(u,e))>0))throw new Error("attribute value no end '"+u+"' match");a(h,d=t.slice(e,l).replace(/&#?\\w+;/g,r),e-1),c=5}else{if(4!=c)throw new Error('attribute value must after "="');a(h,d=t.slice(e,l).replace(/&#?\\w+;/g,r),e),o.warning('attribute "'+h+'" missed start quot('+u+")!!"),e=l+1,c=5}break;case"/":switch(c){case 0:i.setTagName(t.slice(e,l));case 5:case 6:case 7:c=7,i.closed=!0;case 4:case 1:case 2:break;default:throw new Error("attribute invalid close char('/')")}break;case"":return o.error("unexpected end of input"),0==c&&i.setTagName(t.slice(e,l)),l;case">":switch(c){case 0:i.setTagName(t.slice(e,l));case 5:case 6:case 7:break;case 4:case 1:"/"===(d=t.slice(e,l)).slice(-1)&&(i.closed=!0,d=d.slice(0,-1));case 2:2===c&&(d=h),4==c?(o.warning('attribute "'+d+'" missed quot(")!'),a(h,d.replace(/&#?\\w+;/g,r),e)):(n.isHTML(s[""])&&d.match(/^(?:disabled|checked|selected)$/i)||o.warning('attribute "'+d+'" missed value!! "'+d+'" instead!!'),a(d,d,e));break;case 3:throw new Error("attribute value missed!!")}return l;case"\x80":u=" ";default:if(u<=" ")switch(c){case 0:i.setTagName(t.slice(e,l)),c=6;break;case 1:h=t.slice(e,l),c=2;break;case 4:var d=t.slice(e,l).replace(/&#?\\w+;/g,r);o.warning('attribute "'+d+'" missed quot(")!!'),a(h,d,e);case 5:c=6}else switch(c){case 2:i.tagName;n.isHTML(s[""])&&h.match(/^(?:disabled|checked|selected)$/i)||o.warning('attribute "'+h+'" missed value!! "'+h+'" instead2!!'),a(h,h,e),e=l,c=1;break;case 5:o.warning('attribute space is required"'+h+'"!!');case 6:c=1,e=l;break;case 3:c=4,e=l;break;case 7:throw new Error("elements closed character '/' and '>' must be connected to")}}l++}}function u(t,e,i){for(var s=t.tagName,r=null,o=t.length;o--;){var a=t[o],h=a.qName,l=a.value;if((f=h.indexOf(":"))>0)var c=a.prefix=h.slice(0,f),u=h.slice(f+1),d="xmlns"===c&&u;else u=h,c=null,d="xmlns"===h&&"";a.localName=u,!1!==d&&(null==r&&(r={},p(i,i={})),i[d]=r[d]=l,a.uri=n.XMLNS,e.startPrefixMapping(d,l))}for(o=t.length;o--;){(c=(a=t[o]).prefix)&&("xml"===c&&(a.uri=n.XML),"xmlns"!==c&&(a.uri=i[c||""]))}var f;(f=s.indexOf(":"))>0?(c=t.prefix=s.slice(0,f),u=t.localName=s.slice(f+1)):(c=null,u=t.localName=s);var g=t.uri=i[c||""];if(e.startElement(g,u,s,t),!t.closed)return t.currentNSMap=i,t.localNSMap=r,!0;if(e.endElement(g,u,s),r)for(c in r)e.endPrefixMapping(c)}function d(t,e,i,n,s){if(/^(?:script|textarea)$/i.test(i)){var r=t.indexOf("</"+i+">",e),o=t.substring(e+1,r);if(/[&<]/.test(o))return/^script$/i.test(i)?(s.characters(o,0,o.length),r):(o=o.replace(/&#?\\w+;/g,n),s.characters(o,0,o.length),r)}return e+1}function f(t,e,i,n){var s=n[i];return null==s&&((s=t.lastIndexOf("</"+i+">"))<e&&(s=t.lastIndexOf("</"+i)),n[i]=s),s<e}function p(t,e){for(var i in t)e[i]=t[i]}function g(t,e,i,n){switch(t.charAt(e+2)){case"-":return"-"===t.charAt(e+3)?(s=t.indexOf("--\\x3e",e+4))>e?(i.comment(t,e+4,s-e-4),s+3):(n.error("Unclosed comment"),-1):-1;default:if("CDATA["==t.substr(e+3,6)){var s=t.indexOf("]]>",e+9);return i.startCDATA(),i.characters(t,e+9,s-e-9),i.endCDATA(),s+3}var r=function(t,e){var i,n=[],s=/'[^']+'|"[^"]+"|[^\\s<>\\/=]+=?|(\\/?\\s*>|<)/g;s.lastIndex=e,s.exec(t);for(;i=s.exec(t);)if(n.push(i),i[1])return n}(t,e),o=r.length;if(o>1&&/!doctype/i.test(r[0][0])){var a=r[1][0],h=!1,l=!1;o>3&&(/^public$/i.test(r[2][0])?(h=r[3][0],l=o>4&&r[4][0]):/^system$/i.test(r[2][0])&&(l=r[3][0]));var c=r[o-1];return i.startDTD(a,h,l),i.endDTD(),c.index+c[0].length}}return-1}function m(t,e,i){var n=t.indexOf("?>",e);if(n){var s=t.substring(e,n).match(/^<\\?(\\S*)\\s*([\\s\\S]*?)\\s*$/);if(s){s[0].length;return i.processingInstruction(s[1],s[2]),n+2}return-1}return-1}function v(){this.attributeNames={}}a.prototype=new Error,a.prototype.name=a.name,h.prototype={parse:function(t,e,i){var s=this.domBuilder;s.startDocument(),p(e,e={}),function(t,e,i,s,r){function o(t){var e=t.slice(1,-1);return e in i?i[e]:"#"===e.charAt(0)?function(t){if(t>65535){var e=55296+((t-=65536)>>10),i=56320+(1023&t);return String.fromCharCode(e,i)}return String.fromCharCode(t)}(parseInt(e.substr(1).replace("x","0x"))):(r.error("entity not found:"+t),t)}function h(e){if(e>N){var i=t.substring(N,e).replace(/&#?\\w+;/g,o);x&&p(N),s.characters(i,0,e-N),N=e}}function p(e,i){for(;e>=b&&(i=w.exec(t));)y=i.index,b=y+i[0].length,x.lineNumber++;x.columnNumber=e-y+1}var y=0,b=0,w=/.*(?:\\r\\n?|\\n)|.*$/g,x=s.locator,E=[{currentNSMap:e}],S={},N=0;for(;;){try{var _=t.indexOf("<",N);if(_<0){if(!t.substr(N).match(/^\\s*$/)){var T=s.doc,C=T.createTextNode(t.substr(N));T.appendChild(C),s.currentElement=C}return}switch(_>N&&h(_),t.charAt(_+1)){case"/":var O=t.indexOf(">",_+3),I=t.substring(_+2,O).replace(/[ \\t\\n\\r]+$/g,""),R=E.pop();O<0?(I=t.substring(_+2).replace(/[\\s<].*/,""),r.error("end tag name: "+I+" is not complete:"+R.tagName),O=_+1+I.length):I.match(/\\s</)&&(I=I.replace(/[\\s<].*/,""),r.error("end tag name: "+I+" maybe not complete"),O=_+1+I.length);var k=R.localNSMap,A=R.tagName==I;if(A||R.tagName&&R.tagName.toLowerCase()==I.toLowerCase()){if(s.endElement(R.uri,R.localName,I),k)for(var L in k)s.endPrefixMapping(L);A||r.fatalError("end tag name: "+I+" is not match the current start tagName:"+R.tagName)}else E.push(R);O++;break;case"?":x&&p(_),O=m(t,_,s);break;case"!":x&&p(_),O=g(t,_,s,r);break;default:x&&p(_);var j=new v,D=E[E.length-1].currentNSMap,P=(O=c(t,_,j,D,o,r),j.length);if(!j.closed&&f(t,O,j.tagName,S)&&(j.closed=!0,i.nbsp||r.warning("unclosed xml attribute")),x&&P){for(var M=l(x,{}),z=0;z<P;z++){var B=j[z];p(B.offset),B.locator=l(x,{})}s.locator=M,u(j,s,D)&&E.push(j),s.locator=x}else u(j,s,D)&&E.push(j);n.isHTML(j.uri)&&!j.closed?O=d(t,O,j.tagName,o,s):O++}}catch(t){if(t instanceof a)throw t;r.error("element parse error: "+t),O=-1}O>N?N=O:h(Math.max(_,N)+1)}}(t,e,i,s,this.errorHandler),s.endDocument()}},v.prototype={setTagName:function(t){if(!o.test(t))throw new Error("invalid tagName:"+t);this.tagName=t},addValue:function(t,e,i){if(!o.test(t))throw new Error("invalid attribute:"+t);this.attributeNames[t]=this.length,this[this.length++]={qName:t,value:e,offset:i}},length:0,getLocalName:function(t){return this[t].localName},getLocator:function(t){return this[t].locator},getQName:function(t){return this[t].qName},getURI:function(t){return this[t].uri},getValue:function(t){return this[t].value}},e.XMLReader=h,e.ParseError=a},function(t,e,i){"use strict";function n(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}Object.defineProperty(e,"__esModule",{value:!0}),e.createElement=n,e.default={createElement:n}},function(t,e,i){"use strict";function n(t,e){function i(i){for(var n=e.length-1;n>=0;n--){var o=e[n],a=i.clientX,h=i.clientY;if(i.touches&&i.touches.length&&(a=i.touches[0].clientX,h=i.touches[0].clientY),r(o,t,a,h)){o.dispatchEvent(s(i));break}}}if("iframe"===t.nodeName||"IFRAME"===t.nodeName)try{this.target=t.contentDocument}catch(e){this.target=t}else this.target=t;for(var n=["mouseup","mousedown","click","touchstart"],o=0;o<n.length;o++){var a=n[o];this.target.addEventListener(a,(function(t){return i(t)}),!1)}}function s(t){var e=Object.assign({},t,{bubbles:!1});try{return new MouseEvent(t.type,e)}catch(n){var i=document.createEvent("MouseEvents");return i.initMouseEvent(t.type,!1,e.cancelable,e.view,e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget),i}}function r(t,e,i,n){var s=e.getBoundingClientRect();function r(t,e,i){var n=t.top-s.top,r=t.left-s.left,o=n+t.height,a=r+t.width;return n<=i&&r<=e&&o>i&&a>e}if(!r(t.getBoundingClientRect(),i,n))return!1;for(var o=t.getClientRects(),a=0,h=o.length;a<h;a++)if(r(o[a],i,n))return!0;return!1}Object.defineProperty(e,"__esModule",{value:!0}),e.proxyMouse=n,e.clone=s,e.default={proxyMouse:n}},function(t,e,i){var n=i(26);t.exports=function(){return n.Date.now()}},function(t,e,i){(function(e){var i="object"==typeof e&&e&&e.Object===Object&&e;t.exports=i}).call(this,i(17))},function(t,e,i){var n=i(54),s=i(19),r=i(56),o=/^[-+]0x[0-9a-f]+$/i,a=/^0b[01]+$/i,h=/^0o[0-7]+$/i,l=parseInt;t.exports=function(t){if("number"==typeof t)return t;if(r(t))return NaN;if(s(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=s(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=n(t);var i=a.test(t);return i||h.test(t)?l(t.slice(2),i?2:8):o.test(t)?NaN:+t}},function(t,e,i){var n=i(55),s=/^\\s+/;t.exports=function(t){return t?t.slice(0,n(t)+1).replace(s,""):t}},function(t,e){var i=/\\s/;t.exports=function(t){for(var e=t.length;e--&&i.test(t.charAt(e)););return e}},function(t,e,i){var n=i(57),s=i(60);t.exports=function(t){return"symbol"==typeof t||s(t)&&"[object Symbol]"==n(t)}},function(t,e,i){var n=i(27),s=i(58),r=i(59),o=n?n.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":o&&o in Object(t)?s(t):r(t)}},function(t,e,i){var n=i(27),s=Object.prototype,r=s.hasOwnProperty,o=s.toString,a=n?n.toStringTag:void 0;t.exports=function(t){var e=r.call(t,a),i=t[a];try{t[a]=void 0;var n=!0}catch(t){}var s=o.call(t);return n&&(e?t[a]=i:delete t[a]),s}},function(t,e){var i=Object.prototype.toString;t.exports=function(t){return i.call(t)}},function(t,e){t.exports=function(t){return null!=t&&"object"==typeof t}}]).default}));`, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "max-age=3600"
      // 缓存 1 小时
    }
  });
});
var authMiddleware = async (c2, next) => {
  const token = getCookie(c2, "auth_token");
  if (!token) {
    if (c2.req.path.startsWith("/api")) {
      return c2.json({ error: "\u672A\u6388\u6743" }, 401);
    }
    return new Response("\u672A\u6388\u6743", { status: 401 });
  }
  try {
    const decodedPayload = await verify2(token, c2.env.JWT_SECRET);
    c2.set("jwtPayload", decodedPayload);
    await next();
  } catch (e2) {
    console.error("\u8BA4\u8BC1\u4E2D\u95F4\u4EF6\u9519\u8BEF:", e2);
    c2.header("Set-Cookie", "auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
    if (c2.req.path.startsWith("/api")) {
      return c2.json({ error: "\u4EE4\u724C\u65E0\u6548\u6216\u5DF2\u8FC7\u671F" }, 401);
    }
    return new Response("\u4EE4\u724C\u65E0\u6548\u6216\u5DF2\u8FC7\u671F", { status: 401 });
  }
};
var adminMiddleware = async (c2, next) => {
  const payload = c2.get("jwtPayload");
  if (!payload || !payload.isAdmin) {
    return c2.json({ error: "\u7981\u6B62\u8BBF\u95EE\uFF1A\u4EC5\u9650\u7BA1\u7406\u5458" }, 403);
  }
  await next();
};
async function getWebDAVClient(c2) {
  try {
    const config = await c2.env.DB.prepare("SELECT url, username, password FROM webdav_config WHERE id = 1").first();
    if (!config || !config.url || !config.username || !config.password) {
      console.warn("\u6570\u636E\u5E93\u4E2D\u7F3A\u5C11 WebDAV \u914D\u7F6E");
      return null;
    }
    const baseUrl = config.url.endsWith("/") ? config.url.slice(0, -1) : config.url;
    return an(baseUrl, {
      username: config.username,
      password: config.password
    });
  } catch (dbError) {
    console.error("\u4ECE\u6570\u636E\u5E93\u83B7\u53D6 WebDAV \u914D\u7F6E\u65F6\u51FA\u9519:", dbError);
    return null;
  }
}
app.post("/api/register", async (c2) => {
  try {
    const { username, password } = await c2.req.json();
    if (!username || !password) {
      return c2.json({ error: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u662F\u5FC5\u9700\u7684" }, 400);
    }
    if (password.length < 6) {
      return c2.json({ error: "\u5BC6\u7801\u5FC5\u987B\u81F3\u5C11\u4E3A 6 \u4E2A\u5B57\u7B26" }, 400);
    }
    const existingUser = await c2.env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
    if (existingUser) {
      return c2.json({ error: "\u7528\u6237\u540D\u5DF2\u88AB\u5360\u7528" }, 409);
    }
    const userCountResult = await c2.env.DB.prepare("SELECT COUNT(id) as count FROM users").first();
    const isFirstUser = userCountResult.count === 0;
    const salt = bcryptjs_default.genSaltSync(10);
    const passwordHash = bcryptjs_default.hashSync(password, salt);
    await c2.env.DB.prepare("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)").bind(username, passwordHash, isFirstUser ? 1 : 0).run();
    return c2.json({ message: "\u7528\u6237\u6CE8\u518C\u6210\u529F" }, 201);
  } catch (e2) {
    console.error("\u6CE8\u518C\u9519\u8BEF:", e2);
    return c2.json({ error: "\u6CE8\u518C\u5931\u8D25", details: e2.message }, 500);
  }
});
app.post("/api/login", async (c2) => {
  try {
    const { username, password } = await c2.req.json();
    if (!username || !password) {
      return c2.json({ error: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u662F\u5FC5\u9700\u7684" }, 400);
    }
    const user = await c2.env.DB.prepare("SELECT id, password_hash, is_admin FROM users WHERE username = ?").bind(username).first();
    if (!user) {
      return c2.json({ error: "\u51ED\u8BC1\u65E0\u6548" }, 401);
    }
    const isPasswordValid = bcryptjs_default.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return c2.json({ error: "\u51ED\u8BC1\u65E0\u6548" }, 401);
    }
    const expiry = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 7;
    const payload = {
      sub: user.id,
      isAdmin: user.is_admin === 1,
      exp: expiry
    };
    const token = await sign2(payload, c2.env.JWT_SECRET);
    c2.header("Set-Cookie", `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`);
    return c2.json({ message: "\u767B\u5F55\u6210\u529F", isAdmin: user.is_admin === 1 });
  } catch (e2) {
    console.error("\u767B\u5F55\u9519\u8BEF:", e2);
    return c2.json({ error: "\u767B\u5F55\u5931\u8D25", details: e2.message }, 500);
  }
});
var adminApi = new Hono2();
adminApi.use("*", authMiddleware, adminMiddleware);
adminApi.get("/webdav", async (c2) => {
  try {
    const config = await c2.env.DB.prepare("SELECT url, username FROM webdav_config WHERE id = 1").first();
    return c2.json(config || { url: "", username: "" });
  } catch (e2) {
    console.error("\u83B7\u53D6 WebDAV \u914D\u7F6E\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u68C0\u7D22 WebDAV \u914D\u7F6E" }, 500);
  }
});
adminApi.post("/webdav", async (c2) => {
  try {
    const { url, username, password } = await c2.req.json();
    if (!url || !username || !password || !url.startsWith("http")) {
      return c2.json({ error: "\u9700\u8981\u6709\u6548\u7684 URL\uFF08\u4EE5 http/https \u5F00\u5934\uFF09\u3001\u7528\u6237\u540D\u548C\u5BC6\u7801" }, 400);
    }
    try {
      const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
      const testClient = an(baseUrl, { username, password });
      await testClient.getDirectoryContents("/");
      console.log("WebDAV \u8FDE\u63A5\u6D4B\u8BD5\u6210\u529F\u3002");
    } catch (webdavError) {
      console.error("WebDAV \u8FDE\u63A5\u6D4B\u8BD5\u5931\u8D25:", webdavError);
      if (webdavError.response && webdavError.response.status === 401) {
        return c2.json({ error: "WebDAV \u8BA4\u8BC1\u5931\u8D25\u3002\u8BF7\u68C0\u67E5\u7528\u6237\u540D/\u5BC6\u7801\u3002" }, 401);
      } else if (webdavError.message.includes("ECONNREFUSED") || webdavError.message.includes("ENOTFOUND")) {
        return c2.json({ error: "WebDAV \u8FDE\u63A5\u5931\u8D25\u3002\u8BF7\u68C0\u67E5 URL \u6216\u7F51\u7EDC\u3002" }, 400);
      }
      return c2.json({ error: "\u65E0\u6CD5\u8FDE\u63A5\u5230 WebDAV \u670D\u52A1\u5668\u3002", details: webdavError.message || "\u672A\u77E5\u8FDE\u63A5\u9519\u8BEF" }, 500);
    }
    await c2.env.DB.prepare(
      "INSERT INTO webdav_config (id, url, username, password) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET url=excluded.url, username=excluded.username, password=excluded.password"
    ).bind(url, username, password).run();
    return c2.json({ message: "WebDAV \u914D\u7F6E\u5DF2\u6210\u529F\u4FDD\u5B58\u3002" });
  } catch (e2) {
    console.error("\u4FDD\u5B58 WebDAV \u914D\u7F6E\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u4FDD\u5B58 WebDAV \u914D\u7F6E", details: e2.message }, 500);
  }
});
app.route("/api/admin", adminApi);
var bookApi = new Hono2();
bookApi.use("*", authMiddleware);
bookApi.get("/books", async (c2) => {
  const { q: q2 } = c2.req.query();
  const client = await getWebDAVClient(c2);
  if (!client) {
    return c2.json({ error: "WebDAV \u670D\u52A1\u5C1A\u672A\u7531\u7BA1\u7406\u5458\u914D\u7F6E\u3002" }, 503);
  }
  try {
    const directoryItems = await client.getDirectoryContents("/");
    let epubFiles = directoryItems.filter((item) => item.type === "file" && item.filename.toLowerCase().endsWith(".epub"));
    if (q2) {
      const searchTerm = q2.toLowerCase();
      epubFiles = epubFiles.filter((item) => item.basename.toLowerCase().includes(searchTerm));
    }
    const mappedFiles = epubFiles.map((item) => ({
      name: item.basename,
      path: item.filename
      // filename 应该是相对于 client base URL 的路径
    }));
    return c2.json(mappedFiles);
  } catch (e2) {
    console.error("WebDAV \u5217\u51FA\u4E66\u7C4D\u9519\u8BEF:", e2);
    if (e2.response && e2.response.status === 401) {
      return c2.json({ error: "WebDAV \u8BA4\u8BC1\u5931\u8D25\u3002\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u3002" }, 500);
    }
    return c2.json({ error: "\u65E0\u6CD5\u4ECE WebDAV \u83B7\u53D6\u4E66\u7C4D\u3002", details: e2.message }, 500);
  }
});
bookApi.post("/upload", async (c2) => {
  const client = await getWebDAVClient(c2);
  if (!client) {
    return c2.json({ error: "WebDAV \u670D\u52A1\u5C1A\u672A\u7531\u7BA1\u7406\u5458\u914D\u7F6E\u3002" }, 503);
  }
  try {
    const formData = await c2.req.formData();
    const file = formData.get("book");
    if (!file || !(file instanceof File)) {
      return c2.json({ error: "\u672A\u4E0A\u4F20\u6587\u4EF6\u6216\u683C\u5F0F\u65E0\u6548\u3002" }, 400);
    }
    if (!file.name.toLowerCase().endsWith(".epub")) {
      return c2.json({ error: "\u65E0\u6548\u7684\u6587\u4EF6\u7C7B\u578B\u3002\u53EA\u5141\u8BB8\u4E0A\u4F20 .epub \u6587\u4EF6\u3002" }, 400);
    }
    const bookPath = file.name;
    const exists = await client.exists(bookPath);
    if (exists) {
      return c2.json({ error: "\u5DF2\u5B58\u5728\u540C\u540D\u4E66\u7C4D\u3002" }, 409);
    }
    const fileBuffer = await file.arrayBuffer();
    const contentToUpload = typeof Buffer !== "undefined" ? Buffer.from(fileBuffer) : fileBuffer;
    const success = await client.putFileContents(bookPath, contentToUpload);
    if (success) {
      return c2.json({ message: "\u4E66\u7C4D\u4E0A\u4F20\u6210\u529F\uFF01", path: `/${file.name}` });
    } else {
      return c2.json({ error: "\u65E0\u6CD5\u5728 WebDAV \u670D\u52A1\u5668\u4E0A\u4FDD\u5B58\u4E66\u7C4D\u3002" }, 500);
    }
  } catch (e2) {
    console.error("WebDAV \u4E0A\u4F20\u4E66\u7C4D\u9519\u8BEF:", e2);
    if (e2.response && e2.response.status === 401) {
      return c2.json({ error: "WebDAV \u8BA4\u8BC1\u5931\u8D25\u3002\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u3002" }, 500);
    }
    return c2.json({ error: "\u65E0\u6CD5\u5C06\u4E66\u7C4D\u4E0A\u4F20\u5230 WebDAV\u3002", details: e2.message || "\u672A\u77E5\u4E0A\u4F20\u9519\u8BEF" }, 500);
  }
});
bookApi.get("/book/*", async (c2) => {
  const client = await getWebDAVClient(c2);
  if (!client) {
    return c2.json({ error: "WebDAV \u670D\u52A1\u5C1A\u672A\u7531\u7BA1\u7406\u5458\u914D\u7F6E\u3002" }, 503);
  }
  let rawPathSegment = "";
  const pathPrefix = "/api/book";
  try {
    const url = new URL(c2.req.url);
    const fullPath = url.pathname;
    const prefixIndex = fullPath.indexOf(pathPrefix);
    if (prefixIndex === -1) throw new Error(`\u8DEF\u5F84\u524D\u7F00 "${pathPrefix}" \u672A\u627E\u5230`);
    const encodedPart = fullPath.substring(prefixIndex + pathPrefix.length);
    rawPathSegment = decodeURIComponent(encodedPart);
    if (rawPathSegment === "") throw new Error("\u63D0\u53D6\u7684\u4E66\u7C4D\u8DEF\u5F84\u4E3A\u7A7A");
  } catch (e2) {
    console.error("\u89E3\u6790\u4E66\u7C4D\u8DEF\u5F84\u53C2\u6570\u65F6\u51FA\u9519:", c2.req.url, e2);
    return c2.json({ error: "\u4E66\u7C4D\u8DEF\u5F84\u65E0\u6548\u3002", details: e2.message }, 400);
  }
  const bookPathForRequest = rawPathSegment.startsWith("/") ? rawPathSegment.substring(1) : rawPathSegment;
  const bookIdentifierForClient = decodeURIComponent(rawPathSegment.startsWith("/") ? rawPathSegment : "/" + rawPathSegment);
  console.log(`\u4F20\u9012\u7ED9 WebDAV \u5E93\u7684\u539F\u59CB\u7F16\u7801\u8DEF\u5F84: '${bookPathForRequest}'`);
  console.log(`\u7528\u4E8E\u5BA2\u6237\u7AEF/\u6570\u636E\u5E93\u7684\u4EBA\u7C7B\u53EF\u8BFB\u8DEF\u5F84: '${bookIdentifierForClient}'`);
  try {
    const fileContents = await client.getFileContents(bookPathForRequest, { format: "binary" });
    if (!fileContents || fileContents.byteLength !== void 0 && fileContents.byteLength === 0) {
      console.error("WebDAV \u9519\u8BEF\uFF1AgetFileContents \u8FD4\u56DE\u7A7A\u5185\u5BB9\u5BF9\u4E8E", bookPathForRequest);
      return c2.json({ error: "\u4E66\u7C4D\u5185\u5BB9\u4E3A\u7A7A\u6216\u65E0\u6CD5\u68C0\u7D22\u3002", path: bookIdentifierForClient }, 500);
    }
    const response = new Response(fileContents, {
      headers: {
        "Content-Type": "application/epub+zip",
        ...fileContents.byteLength !== void 0 && { "Content-Length": fileContents.byteLength.toString() }
      }
    });
    return response;
  } catch (e2) {
    console.error(`WebDAV \u83B7\u53D6\u4E66\u7C4D\u5185\u5BB9\u9519\u8BEF: \u8BF7\u6C42\u8DEF\u5F84='${bookPathForRequest}' (\u539F\u59CB\u6807\u8BC6: '${bookIdentifierForClient}')`, e2);
    const status = e2.response?.status;
    const responseText = await e2.response?.text?.().catch(() => null);
    if (status === 404) {
      return c2.json({ error: `\u5728 WebDAV \u670D\u52A1\u5668\u4E0A\u627E\u4E0D\u5230\u4E66\u7C4D: ${bookIdentifierForClient}`, path: bookIdentifierForClient }, 404);
    }
    if (status === 401) {
      return c2.json({ error: "WebDAV \u8BA4\u8BC1\u5931\u8D25\u3002\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u3002", path: bookIdentifierForClient }, 401);
    }
    if (status === 400) {
      console.error("WebDAV \u8FD4\u56DE 400 Bad Request\u3002\u54CD\u5E94\u4F53:", responseText);
      return c2.json({ error: "WebDAV \u670D\u52A1\u5668\u8FD4\u56DE Bad Request\u3002\u53EF\u80FD\u662F\u5E93\u5904\u7406\u8DEF\u5F84\u7684\u65B9\u5F0F\u4E0E\u670D\u52A1\u5668\u4E0D\u517C\u5BB9\u3002", path: bookIdentifierForClient, details: responseText || e2.message }, 400);
    }
    return c2.json({ error: "\u65E0\u6CD5\u4ECE WebDAV \u83B7\u53D6\u4E66\u7C4D\u5185\u5BB9\u3002", path: bookIdentifierForClient, details: responseText || e2.message || "\u672A\u77E5\u9519\u8BEF" }, 500);
  }
});
bookApi.get("/progress/*", async (c2) => {
  const payload = c2.get("jwtPayload");
  const userId = payload.sub;
  let bookIdentifier = "";
  const pathPrefix = "/api/progress";
  try {
    const url = new URL(c2.req.url);
    const fullPath = url.pathname;
    const prefixIndex = fullPath.indexOf(pathPrefix);
    if (prefixIndex === -1) throw new Error(`\u8DEF\u5F84\u524D\u7F00 "${pathPrefix}" \u672A\u627E\u5230`);
    const encodedPart = fullPath.substring(prefixIndex + pathPrefix.length);
    bookIdentifier = decodeURIComponent(encodedPart);
    if (bookIdentifier === "") throw new Error("\u63D0\u53D6\u7684\u4E66\u7C4D\u6807\u8BC6\u7B26\u4E3A\u7A7A");
    if (!bookIdentifier.startsWith("/")) bookIdentifier = "/" + bookIdentifier;
  } catch (e2) {
    console.error("\u5904\u7406\u8FDB\u5EA6\u8DEF\u5F84\u9519\u8BEF:", c2.req.path, e2);
    return c2.json({ error: "\u4E66\u7C4D\u6807\u8BC6\u7B26\u7F16\u7801\u6216\u683C\u5F0F\u65E0\u6548" }, 400);
  }
  if (!bookIdentifier || bookIdentifier === "/") {
    return c2.json({ error: "\u65E0\u6548\u7684\u4E66\u7C4D\u6807\u8BC6\u7B26" }, 400);
  }
  try {
    const progress = await c2.env.DB.prepare(
      "SELECT cfi FROM reading_progress WHERE user_id = ? AND book_identifier = ?"
    ).bind(userId, bookIdentifier).first();
    return c2.json({ cfi: progress?.cfi ?? null });
  } catch (e2) {
    console.error("\u83B7\u53D6\u8FDB\u5EA6\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u83B7\u53D6\u9605\u8BFB\u8FDB\u5EA6" }, 500);
  }
});
bookApi.post("/progress", async (c2) => {
  const payload = c2.get("jwtPayload");
  const userId = payload.sub;
  const { book_identifier, cfi } = await c2.req.json();
  if (!book_identifier || typeof book_identifier !== "string" || !book_identifier.startsWith("/")) {
    return c2.json({ error: "\u65E0\u6548\u7684\u4E66\u7C4D\u6807\u8BC6\u7B26\u683C\u5F0F\uFF08\u5FC5\u987B\u662F\u4EE5 / \u5F00\u5934\u7684\u5B57\u7B26\u4E32\uFF09" }, 400);
  }
  if (typeof cfi !== "string") {
    return c2.json({ error: "cfi\uFF08\u5B57\u7B26\u4E32\uFF09\u662F\u5FC5\u9700\u7684" }, 400);
  }
  try {
    await c2.env.DB.prepare(
      `INSERT INTO reading_progress (user_id, book_identifier, cfi, updated_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(user_id, book_identifier)
             DO UPDATE SET cfi=excluded.cfi, updated_at=CURRENT_TIMESTAMP`
    ).bind(userId, book_identifier, cfi).run();
    return c2.json({ message: "\u8FDB\u5EA6\u5DF2\u4FDD\u5B58" });
  } catch (e2) {
    console.error("\u4FDD\u5B58\u8FDB\u5EA6\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u4FDD\u5B58\u8FDB\u5EA6", details: e2.message }, 500);
  }
});
bookApi.get("/bookmarks/*", async (c2) => {
  const payload = c2.get("jwtPayload");
  const userId = payload.sub;
  let bookIdentifier = "";
  const pathPrefix = "/api/bookmarks";
  try {
    const url = new URL(c2.req.url);
    const fullPath = url.pathname;
    const prefixIndex = fullPath.indexOf(pathPrefix);
    if (prefixIndex === -1) throw new Error(`\u8DEF\u5F84\u524D\u7F00 "${pathPrefix}" \u672A\u627E\u5230`);
    const encodedPart = fullPath.substring(prefixIndex + pathPrefix.length);
    bookIdentifier = decodeURIComponent(encodedPart);
    if (bookIdentifier === "") throw new Error("\u63D0\u53D6\u7684\u4E66\u7C4D\u6807\u8BC6\u7B26\u4E3A\u7A7A");
    if (!bookIdentifier.startsWith("/")) bookIdentifier = "/" + bookIdentifier;
  } catch (e2) {
    console.error("\u5904\u7406\u4E66\u7B7E\u8DEF\u5F84\u9519\u8BEF:", c2.req.path, e2);
    return c2.json({ error: "\u4E66\u7C4D\u6807\u8BC6\u7B26\u7F16\u7801\u6216\u683C\u5F0F\u65E0\u6548" }, 400);
  }
  if (!bookIdentifier || bookIdentifier === "/") {
    return c2.json({ error: "\u65E0\u6548\u7684\u4E66\u7C4D\u6807\u8BC6\u7B26" }, 400);
  }
  try {
    const bookmarks = await c2.env.DB.prepare(
      "SELECT id, cfi, label, created_at FROM bookmarks WHERE user_id = ? AND book_identifier = ? ORDER BY created_at DESC"
    ).bind(userId, bookIdentifier).all();
    return c2.json(bookmarks?.results || []);
  } catch (e2) {
    console.error("\u83B7\u53D6\u4E66\u7B7E\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u68C0\u7D22\u4E66\u7B7E" }, 500);
  }
});
bookApi.post("/bookmarks", async (c2) => {
  const payload = c2.get("jwtPayload");
  const userId = payload.sub;
  const { book_identifier, cfi, label } = await c2.req.json();
  if (!book_identifier || typeof book_identifier !== "string" || !book_identifier.startsWith("/")) {
    return c2.json({ error: "\u65E0\u6548\u7684\u4E66\u7C4D\u6807\u8BC6\u7B26\u683C\u5F0F\uFF08\u5FC5\u987B\u662F\u4EE5 / \u5F00\u5934\u7684\u5B57\u7B26\u4E32\uFF09" }, 400);
  }
  if (!cfi || typeof cfi !== "string") {
    return c2.json({ error: "cfi\uFF08\u5B57\u7B26\u4E32\uFF09\u662F\u5FC5\u9700\u7684" }, 400);
  }
  const cleanLabel = label && typeof label === "string" ? label.substring(0, 100) : null;
  try {
    const existing = await c2.env.DB.prepare(
      "SELECT id FROM bookmarks WHERE user_id = ? AND book_identifier = ? AND cfi = ?"
    ).bind(userId, book_identifier, cfi).first();
    if (existing) {
      return c2.json({ error: "\u6B64\u4F4D\u7F6E\u7684\u4E66\u7B7E\u5DF2\u5B58\u5728" }, 409);
    }
    const result = await c2.env.DB.prepare(
      "INSERT INTO bookmarks (user_id, book_identifier, cfi, label) VALUES (?, ?, ?, ?)"
    ).bind(userId, book_identifier, cfi, cleanLabel).run();
    if (result.success) {
      return c2.json({ message: "\u4E66\u7B7E\u5DF2\u6DFB\u52A0" }, 201);
    } else {
      throw new Error("\u65E0\u6CD5\u5C06\u4E66\u7B7E\u63D2\u5165\u6570\u636E\u5E93\u3002");
    }
  } catch (e2) {
    if (e2.message && e2.message.toLowerCase().includes("unique constraint failed")) {
      return c2.json({ error: "\u6B64\u4F4D\u7F6E\u7684\u4E66\u7B7E\u5DF2\u5B58\u5728" }, 409);
    }
    console.error("\u6DFB\u52A0\u4E66\u7B7E\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u6DFB\u52A0\u4E66\u7B7E", details: e2.message }, 500);
  }
});
bookApi.delete("/bookmark/:id", async (c2) => {
  const payload = c2.get("jwtPayload");
  const userId = payload.sub;
  const bookmarkId = c2.req.param("id");
  if (!/^\d+$/.test(bookmarkId)) {
    return c2.json({ error: "\u65E0\u6548\u7684\u4E66\u7B7E ID \u683C\u5F0F" }, 400);
  }
  const bookmarkIdNum = Number(bookmarkId);
  try {
    const result = await c2.env.DB.prepare(
      "DELETE FROM bookmarks WHERE id = ? AND user_id = ?"
    ).bind(bookmarkIdNum, userId).run();
    if (!result.success) {
      console.error("\u5220\u9664\u4E66\u7B7E\u5931\u8D25\uFF0C\u7ED3\u679C:", result);
      return c2.json({ error: "\u672A\u627E\u5230\u4E66\u7B7E\u6216\u60A8\u65E0\u6743\u5220\u9664\u5B83" }, 404);
    }
    return c2.json({ message: "\u4E66\u7B7E\u5DF2\u6210\u529F\u5220\u9664" });
  } catch (e2) {
    console.error("\u5220\u9664\u4E66\u7B7E\u9519\u8BEF:", e2);
    return c2.json({ error: "\u65E0\u6CD5\u5220\u9664\u4E66\u7B7E", details: e2.message }, 500);
  }
});
app.route("/api", bookApi);
app.all("/api/*", (c2) => c2.json({ error: "\u672A\u627E\u5230" }, 404));
var index_default = app;
export {
  index_default as default
};
/*! Bundled license information:

webdav/dist/web/index.js:
  (*! For license information please see index.js.LICENSE.txt *)
*/
