/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _jsreportStudio = __webpack_require__(1);
	
	var _jsreportStudio2 = _interopRequireDefault(_jsreportStudio);
	
	var _CreateSamplesModal = __webpack_require__(2);
	
	var _CreateSamplesModal2 = _interopRequireDefault(_CreateSamplesModal);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	_jsreportStudio2.default.readyListeners.push(function () {
	  var samplesCreated = _jsreportStudio2.default.getSettingValueByKey('sample-created', false) === true;
	
	  if (_jsreportStudio2.default.extensions['sample-template'].options.createSamples != null || samplesCreated === true || _jsreportStudio2.default.extensions['sample-template'].options.skipCreateSamplesModal === true) {
	    return;
	  }
	
	  if (_jsreportStudio2.default.getAllEntities().length === 0) {
	    _jsreportStudio2.default.openModal(_CreateSamplesModal2.default);
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = Studio;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _jsreportStudio = __webpack_require__(1);
	
	var _jsreportStudio2 = _interopRequireDefault(_jsreportStudio);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var CreateSamplesModal = function (_Component) {
	  _inherits(CreateSamplesModal, _Component);
	
	  function CreateSamplesModal(props) {
	    _classCallCheck(this, CreateSamplesModal);
	
	    var _this = _possibleConstructorReturn(this, (CreateSamplesModal.__proto__ || Object.getPrototypeOf(CreateSamplesModal)).call(this, props));
	
	    _this.state = {
	      creating: false
	    };
	    return _this;
	  }
	
	  _createClass(CreateSamplesModal, [{
	    key: 'close',
	    value: function close() {
	      var close = this.props.close;
	
	
	      close();
	    }
	  }, {
	    key: 'createSamples',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(shouldIgnore) {
	        var close, ignore;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                close = this.props.close;
	                ignore = shouldIgnore === true;
	
	
	                this.setState({
	                  creating: true
	                });
	
	                _context.next = 5;
	                return _jsreportStudio2.default.api.post('/studio/create-samples', {
	                  data: {
	                    ignore: ignore
	                  }
	                });
	
	              case 5:
	
	                this.setState({
	                  creating: false
	                });
	
	                if (ignore) {
	                  close();
	                } else {
	                  close();
	
	                  _jsreportStudio2.default.reset().catch(function (e) {
	                    console.error(e);
	                  });
	                }
	
	              case 7:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	
	      function createSamples(_x) {
	        return _ref.apply(this, arguments);
	      }
	
	      return createSamples;
	    }()
	  }, {
	    key: 'render',
	    value: function render() {
	      var _this2 = this;
	
	      var creating = this.state.creating;
	
	
	      return _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(
	          'h1',
	          null,
	          'Create samples'
	        ),
	        _react2.default.createElement(
	          'p',
	          null,
	          'Would you like that we create some default examples for you?'
	        ),
	        _react2.default.createElement(
	          'div',
	          null,
	          _react2.default.createElement(
	            'div',
	            { className: 'button-bar' },
	            _react2.default.createElement(
	              'button',
	              { disabled: creating, className: 'button confirmation', onClick: function onClick() {
	                  return _this2.createSamples(true);
	                } },
	              'No'
	            ),
	            _react2.default.createElement(
	              'button',
	              { disabled: creating, className: 'button danger', onClick: function onClick() {
	                  return _this2.createSamples();
	                } },
	              'Yes'
	            )
	          )
	        )
	      );
	    }
	  }]);
	
	  return CreateSamplesModal;
	}(_react.Component);
	
	CreateSamplesModal.propTypes = {
	  close: _react.PropTypes.func.isRequired,
	  options: _react.PropTypes.object.isRequired
	};
	exports.default = CreateSamplesModal;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = Studio.libraries['react'];

/***/ }
/******/ ]);