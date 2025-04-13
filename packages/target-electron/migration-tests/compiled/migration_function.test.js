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

// ../../node_modules/.pnpm/stackframe@1.3.4/node_modules/stackframe/stackframe.js
var require_stackframe = __commonJS({
  "../../node_modules/.pnpm/stackframe@1.3.4/node_modules/stackframe/stackframe.js"(exports, module) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("stackframe", [], factory);
      } else if (typeof exports === "object") {
        module.exports = factory();
      } else {
        root.StackFrame = factory();
      }
    })(exports, function() {
      "use strict";
      function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
      }
      function _getter(p) {
        return function() {
          return this[p];
        };
      }
      var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"];
      var numericProps = ["columnNumber", "lineNumber"];
      var stringProps = ["fileName", "functionName", "source"];
      var arrayProps = ["args"];
      var objectProps = ["evalOrigin"];
      var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);
      function StackFrame(obj) {
        if (!obj)
          return;
        for (var i2 = 0; i2 < props.length; i2++) {
          if (obj[props[i2]] !== void 0) {
            this["set" + _capitalize(props[i2])](obj[props[i2]]);
          }
        }
      }
      StackFrame.prototype = {
        getArgs: function() {
          return this.args;
        },
        setArgs: function(v) {
          if (Object.prototype.toString.call(v) !== "[object Array]") {
            throw new TypeError("Args must be an Array");
          }
          this.args = v;
        },
        getEvalOrigin: function() {
          return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
          if (v instanceof StackFrame) {
            this.evalOrigin = v;
          } else if (v instanceof Object) {
            this.evalOrigin = new StackFrame(v);
          } else {
            throw new TypeError("Eval Origin must be an Object or StackFrame");
          }
        },
        toString: function() {
          var fileName = this.getFileName() || "";
          var lineNumber = this.getLineNumber() || "";
          var columnNumber = this.getColumnNumber() || "";
          var functionName = this.getFunctionName() || "";
          if (this.getIsEval()) {
            if (fileName) {
              return "[eval] (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
            }
            return "[eval]:" + lineNumber + ":" + columnNumber;
          }
          if (functionName) {
            return functionName + " (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
          }
          return fileName + ":" + lineNumber + ":" + columnNumber;
        }
      };
      StackFrame.fromString = function StackFrame$$fromString(str) {
        var argsStartIndex = str.indexOf("(");
        var argsEndIndex = str.lastIndexOf(")");
        var functionName = str.substring(0, argsStartIndex);
        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(",");
        var locationString = str.substring(argsEndIndex + 1);
        if (locationString.indexOf("@") === 0) {
          var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, "");
          var fileName = parts[1];
          var lineNumber = parts[2];
          var columnNumber = parts[3];
        }
        return new StackFrame({
          functionName,
          args: args || void 0,
          fileName,
          lineNumber: lineNumber || void 0,
          columnNumber: columnNumber || void 0
        });
      };
      for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype["set" + _capitalize(booleanProps[i])] = /* @__PURE__ */ function(p) {
          return function(v) {
            this[p] = Boolean(v);
          };
        }(booleanProps[i]);
      }
      for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype["set" + _capitalize(numericProps[j])] = /* @__PURE__ */ function(p) {
          return function(v) {
            if (!_isNumber(v)) {
              throw new TypeError(p + " must be a Number");
            }
            this[p] = Number(v);
          };
        }(numericProps[j]);
      }
      for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype["set" + _capitalize(stringProps[k])] = /* @__PURE__ */ function(p) {
          return function(v) {
            this[p] = String(v);
          };
        }(stringProps[k]);
      }
      return StackFrame;
    });
  }
});

// ../../node_modules/.pnpm/error-stack-parser@2.1.4/node_modules/error-stack-parser/error-stack-parser.js
var require_error_stack_parser = __commonJS({
  "../../node_modules/.pnpm/error-stack-parser@2.1.4/node_modules/error-stack-parser/error-stack-parser.js"(exports, module) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("error-stack-parser", ["stackframe"], factory);
      } else if (typeof exports === "object") {
        module.exports = factory(require_stackframe());
      } else {
        root.ErrorStackParser = factory(root.StackFrame);
      }
    })(exports, function ErrorStackParser(StackFrame) {
      "use strict";
      var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
      var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
      var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
      return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
          if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
            return this.parseOpera(error);
          } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
            return this.parseV8OrIE(error);
          } else if (error.stack) {
            return this.parseFFOrSafari(error);
          } else {
            throw new Error("Cannot parse given Error object");
          }
        },
        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
          if (urlLike.indexOf(":") === -1) {
            return [urlLike];
          }
          var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
          var parts = regExp.exec(urlLike.replace(/[()]/g, ""));
          return [parts[1], parts[2] || void 0, parts[3] || void 0];
        },
        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
          var filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(CHROME_IE_STACK_REGEXP);
          }, this);
          return filtered.map(function(line) {
            if (line.indexOf("(eval ") > -1) {
              line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
            }
            var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
            var location = sanitizedLine.match(/ (\(.+\)$)/);
            sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
            var locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
            var functionName = location && sanitizedLine || void 0;
            var fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
            return new StackFrame({
              functionName,
              fileName,
              lineNumber: locationParts[1],
              columnNumber: locationParts[2],
              source: line
            });
          }, this);
        },
        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
          var filtered = error.stack.split("\n").filter(function(line) {
            return !line.match(SAFARI_NATIVE_CODE_REGEXP);
          }, this);
          return filtered.map(function(line) {
            if (line.indexOf(" > eval") > -1) {
              line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
            }
            if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
              return new StackFrame({
                functionName: line
              });
            } else {
              var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
              var matches = line.match(functionNameRegex);
              var functionName = matches && matches[1] ? matches[1] : void 0;
              var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
              return new StackFrame({
                functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
              });
            }
          }, this);
        },
        parseOpera: function ErrorStackParser$$parseOpera(e) {
          if (!e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
            return this.parseOpera9(e);
          } else if (!e.stack) {
            return this.parseOpera10(e);
          } else {
            return this.parseOpera11(e);
          }
        },
        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
          var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
          var lines = e.message.split("\n");
          var result = [];
          for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
              result.push(new StackFrame({
                fileName: match[2],
                lineNumber: match[1],
                source: lines[i]
              }));
            }
          }
          return result;
        },
        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
          var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
          var lines = e.stacktrace.split("\n");
          var result = [];
          for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
              result.push(
                new StackFrame({
                  functionName: match[3] || void 0,
                  fileName: match[2],
                  lineNumber: match[1],
                  source: lines[i]
                })
              );
            }
          }
          return result;
        },
        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
          var filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
          }, this);
          return filtered.map(function(line) {
            var tokens = line.split("@");
            var locationParts = this.extractLocation(tokens.pop());
            var functionCall = tokens.shift() || "";
            var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
            var argsRaw;
            if (functionCall.match(/\(([^)]*)\)/)) {
              argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
            }
            var args = argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(",");
            return new StackFrame({
              functionName,
              args,
              fileName: locationParts[0],
              lineNumber: locationParts[1],
              columnNumber: locationParts[2],
              source: line
            });
          }, this);
        }
      };
    });
  }
});

// migration-tests/migration_function.test.ts
import { describe } from "mocha";
import { expect } from "chai";
import { existsSync as existsSync2, mkdtempSync } from "fs";
import { join as join2, dirname } from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import { tmpdir } from "os";
import { readdir as readdir2 } from "fs/promises";

// src/deltachat/migration.ts
import { startDeltaChat } from "@deltachat/stdio-rpc-server";
import { existsSync, lstatSync } from "fs";
import { join } from "path";
import { mkdir, readdir, rename, rm, rmdir, stat } from "fs/promises";
async function migrateAccountsIfNeeded(cwd, log3, treatFailedMigrationAsError = false) {
  let tmpDC;
  const eventLogger = (accountId, event) => log3.debug("core-event", { accountId, ...event });
  try {
    const new_accounts_format = existsSync(join(cwd, "accounts.toml"));
    if (new_accounts_format) {
      log3.debug("migration not needed: accounts.toml already exists");
      return false;
    }
    log3.debug("accounts.toml not found, checking if there is previous data");
    const configPath = join(cwd, "..");
    const accountFoldersFormat1 = (await readdir(configPath)).filter(
      (folderName) => {
        const path = join(configPath, folderName);
        try {
          const db_path = join(path, "db.sqlite");
          return lstatSync(path).isDirectory() && existsSync(db_path) && lstatSync(db_path).isFile() && !lstatSync(path).isSymbolicLink();
        } catch (error) {
          log3.debug("error while testing if folder is account", error);
          return false;
        }
      }
    );
    const migrateFromFormat1 = accountFoldersFormat1.length !== 0;
    const migrateFromFormat2 = existsSync(cwd);
    if (!migrateFromFormat1 && !migrateFromFormat2) {
      log3.info("migration not needed: nothing to migrate");
      return false;
    }
    const path_accounts = join(cwd, "..", "accounts");
    const pathAccountsOld = join(cwd, "..", "accounts_old");
    if (migrateFromFormat2) {
      log3.info(`found old some accounts (format 2), we need to migrate...`);
      await rename(path_accounts, pathAccountsOld);
    }
    tmpDC = await startDeltaChat(path_accounts, {
      muteStdErr: false
    });
    tmpDC.on("ALL", eventLogger);
    const oldFoldersToDelete = [];
    if (migrateFromFormat1) {
      log3.info(
        `found old ${accountFoldersFormat1.length} legacy accounts (1), we need to migrate...`
      );
      for (const folder of accountFoldersFormat1) {
        log3.debug(`migrating legacy account "${folder}"`);
        const pathDBFile = join(configPath, folder, "db.sqlite");
        const blobsFolder = join(configPath, folder, "db.sqlite-blobs");
        if (!existsSync(blobsFolder)) {
          await mkdir(blobsFolder, { recursive: true });
        }
        try {
          await tmpDC.rpc.migrateAccount(pathDBFile);
          oldFoldersToDelete.push(folder);
        } catch (error) {
          log3.error(`Failed to migrate account at path "${pathDBFile}"`, error);
          if (treatFailedMigrationAsError) {
            throw error;
          }
        }
      }
    }
    if (migrateFromFormat2) {
      for (const entry of await readdir(pathAccountsOld)) {
        const stat_result = await stat(join(pathAccountsOld, entry));
        if (!stat_result.isDirectory())
          continue;
        log3.debug(`migrating account "${join(pathAccountsOld, entry)}"`);
        const path_dbfile = join(pathAccountsOld, entry, "db.sqlite");
        if (!existsSync(path_dbfile)) {
          log3.warn(
            "found an old accounts folder without a db.sqlite file, skipping"
          );
          continue;
        }
        const blobsFolder = join(pathAccountsOld, entry, "db.sqlite-blobs");
        if (!existsSync(blobsFolder)) {
          await mkdir(blobsFolder, { recursive: true });
        }
        try {
          const account_id = await tmpDC.rpc.migrateAccount(path_dbfile);
          const old_sticker_folder = join(pathAccountsOld, entry, "stickers");
          if (existsSync(old_sticker_folder)) {
            log3.debug("found stickers, migrating them", old_sticker_folder);
            try {
              const blobdir = await tmpDC.rpc.getBlobDir(account_id);
              if (!blobdir) {
                throw new Error("blobdir is undefined");
              }
              const new_sticker_folder = join(blobdir, "../stickers");
              await rename(old_sticker_folder, new_sticker_folder);
            } catch (error) {
              log3.error("stickers migration failed", old_sticker_folder, error);
              if (treatFailedMigrationAsError) {
                throw error;
              }
            }
          }
          oldFoldersToDelete.push(join(pathAccountsOld, entry));
        } catch (error) {
          log3.error(
            `Failed to migrate account at path "${path_dbfile}":`,
            error
          );
        }
      }
    }
    tmpDC.off("ALL", eventLogger);
    tmpDC.close();
    for (const oldFolder of oldFoldersToDelete.map((f) => join(configPath, f))) {
      try {
        try {
          await rm(join(oldFolder, ".DS_Store"));
        } catch (error) {
        }
        await rmdir(oldFolder);
      } catch (error) {
        log3.error("Failed to cleanup old folder:", oldFolder, error);
      }
    }
    log3.info("migration completed");
    return true;
  } catch (err) {
    tmpDC?.off("ALL", eventLogger);
    tmpDC?.close();
    throw err;
  }
}

// ../shared/logger.ts
var import_error_stack_parser = __toESM(require_error_stack_parser(), 1);
var startTime = Date.now();
var colorize = (light, code) => (str) => "\x1B[" + light + ";" + code + "m" + str + "\x1B[0m";
var blue = colorize(1, 34);
var red = colorize(1, 31);
var yellow = colorize(1, 33);
var grey = colorize(0, 37);
var green = colorize(1, 37);
var cyan = colorize(1, 36);
var emojiFontCss = 'font-family: Roboto, "Apple Color Emoji", NotoEmoji, "Helvetica Neue", Arial, Helvetica, NotoMono, sans-serif !important;';
var LoggerVariants = [
  {
    log: console.debug,
    level: "DEBUG" /* DEBUG */,
    emoji: "\u{1F578}\uFE0F",
    symbol: "[D]"
  },
  {
    log: console.info,
    level: "INFO" /* INFO */,
    emoji: "\u2139\uFE0F",
    symbol: blue("[i]")
  },
  {
    log: console.warn,
    level: "WARNING" /* WARNING */,
    emoji: "\u26A0\uFE0F",
    symbol: yellow("[w]")
  },
  {
    log: console.error,
    level: "ERROR" /* ERROR */,
    emoji: "\u{1F6A8}",
    symbol: red("[E]")
  },
  {
    log: console.error,
    level: "CRITICAL" /* CRITICAL */,
    emoji: "\u{1F6A8}\u{1F6A8}",
    symbol: red("[C]")
  }
];
var handler;
var rc = {};
function setLogHandler(LogHandler, rcObject) {
  handler = LogHandler;
  rc = rcObject;
}
function log({ channel, isMainProcess }, level, stacktrace, args) {
  const variant = LoggerVariants[level];
  if (!handler) {
    console.log("Failed to log message - Handler not initialized yet");
    console.log(`Log Message: ${channel} ${level} ${args.join(" ")}`);
    throw Error("Failed to log message - Handler not initialized yet");
  }
  handler(channel, variant.level, stacktrace, ...args);
  if (rc["log-to-console"]) {
    if (isMainProcess) {
      const beginning = `${Math.round((Date.now() - startTime) / 100) / 10}s ${LoggerVariants[level].symbol}${grey(channel)}:`;
      if (!stacktrace) {
        variant.log(beginning, ...args);
      } else {
        variant.log(
          beginning,
          ...args,
          red(
            Array.isArray(stacktrace) ? stacktrace.map((s) => `
${s.toString()}`).join() : stacktrace
          )
        );
      }
    } else {
      const prefix = `%c${variant.emoji}%c${channel}`;
      const prefixStyle = [emojiFontCss, "color:blueviolet;"];
      if (stacktrace) {
        variant.log(prefix, ...prefixStyle, stacktrace, ...args);
      } else {
        variant.log(prefix, ...prefixStyle, ...args);
      }
    }
  }
}
var Logger = class {
  constructor(channel) {
    this.channel = channel;
    //@ts-ignore
    this.isMainProcess = typeof window === "undefined";
    if (channel === "core/event") {
      this.getStackTrace = () => "";
    }
  }
  getStackTrace() {
    const rawStack = import_error_stack_parser.default.parse(
      new Error("Get Stacktrace")
    );
    const stack = rawStack.slice(2, rawStack.length);
    return rc["machine-readable-stacktrace"] ? stack : stack.map((s) => `
${s.toString()}`).join();
  }
  debug(...args) {
    if (!rc["log-debug"])
      return;
    log(this, 0, "", args);
  }
  info(...args) {
    log(this, 1, "", args);
  }
  warn(...args) {
    log(this, 2, this.getStackTrace(), args);
  }
  error(...args) {
    log(this, 3, this.getStackTrace(), args);
  }
  /** use this when you know that the stacktrace is not relevant */
  errorWithoutStackTrace(...args) {
    log(this, 3, [], args);
  }
  critical(...args) {
    log(this, 4, this.getStackTrace(), args);
  }
};
function getLogger(channel) {
  return new Logger(channel);
}
if (!("toJSON" in Error.prototype))
  Object.defineProperty(Error.prototype, "toJSON", {
    value: function() {
      const alt = {};
      Object.getOwnPropertyNames(this).forEach(function(key) {
        alt[key] = this[key];
      }, this);
      return alt;
    },
    configurable: true,
    writable: true
  });

// migration-tests/migration_function.test.ts
import { startDeltaChat as startDeltaChat2 } from "@deltachat/stdio-rpc-server";
var __dirname = dirname(fileURLToPath(import.meta.url));
var log2 = getLogger("test");
before(async () => {
  if (process.env["DEBUG"]) {
    setLogHandler(console.debug, {
      "log-debug": process.env["DEBUG"] == "2"
    });
  } else {
    setLogHandler(() => {
    }, {});
  }
});
var zip = new AdmZip(join2(__dirname, "../test_data/migration-test-data.zip"));
var testEnvironment = mkdtempSync(join2(tmpdir(), "deltachat-migration-test-"));
zip.extractAllTo(testEnvironment);
log2.debug({ testEnvironment });
var versions = await readdir2(testEnvironment);
var BROKEN_TEST_DATA = [
  "DeltaChat-1.3.1.AppImage",
  "DeltaChat-1.3.3.AppImage"
];
describe("/electron/main/account-migration", async () => {
  for (const version of versions) {
    const versionPath = join2(testEnvironment, version);
    if (BROKEN_TEST_DATA.includes(version)) {
      continue;
    }
    it(`migration from ${version} works`, async () => {
      const targetFolder = join2(versionPath, "DeltaChat/accounts");
      log2.info({ targetFolder });
      log2.debug(
        { targetFolder },
        await readdir2(versionPath, { recursive: true })
      );
      if (!existsSync2(join2(targetFolder, "accounts.toml"))) {
        const migrated = await migrateAccountsIfNeeded(targetFolder, log2, true);
        expect(migrated).to.be.true;
      } else {
        log2.debug(
          "accounts.toml already exists, the migration from absolute paths to relative ones should happen on normal start"
        );
      }
      const eventLogger = (accountId, event) => log2.debug("core-event", { accountId, ...event });
      const tmpDC = await startDeltaChat2(targetFolder, {
        disableEnvPath: true,
        muteStdErr: process.env["DEBUG"] === void 0 || process.env["RUST_LOG"] === void 0
      });
      tmpDC.on("ALL", eventLogger);
      after(() => {
        tmpDC.off("ALL", eventLogger);
        tmpDC.close();
      });
      log2.debug("test if migration worked");
      const accounts = await tmpDC.rpc.getAllAccounts();
      const configured_accounts = accounts.filter(
        (acc) => acc.kind === "Configured"
      );
      expect(configured_accounts).to.have.length(2);
      expect(
        configured_accounts.map((acc) => acc.kind === "Configured" && acc.addr)
      ).to.have.members(["tmpy.mh3we@testrun.org", "tmpy.3ftgt@testrun.org"]);
      log2.debug("test done");
    });
  }
});
//# sourceMappingURL=migration_function.test.js.map
