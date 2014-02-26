;(function($, window, undefined){ "use strict";

/**
 * Add reverse capability to jQuery objects.
 * May not be safe for use with iterations.
 * @type {Function}
 */
$.fn.reverse = [].reverse;

/**
 * String interpolation implementation
 * @access public
 * @return {String} The interpolated string value
 */
String.prototype.f = function() {
  var s = this, i = arguments.length;
  while (i--) s = s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  return s;
};

/**
 * Creates an animated feature slideshow.
 * @access public
 * @param  {Object} opts   Overrides to the default plugin settings
 * @return {jQuery Object} The slideshow jQuery Object originally chained with this method
 */
$.fn.slideshow = function(opts) {

  /////////////////////////////////////////////////////////////////////////////
  // DEFAULTS & OPTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * The default settings that can be overriden by opts at runtime
   * @type {Object}
   */
  var defaults = {
    slides          : '.slides',
    secondarySlides : '.secondary-slides',
    slide           : '.slide',
    slideNav        : '.slide-counter',
    slideNavElement : 'a',
    nextButton      : '.next-slide',
    prevButton      : '.prev-slide',
    duration        : 6000,
    speed           : 400,
    style           : 'fade',
    secondaryStyle  : 'fade',
    currentClass    : 'active',
    counter         : 'counter',
    count           : 'count'
  };

  /**
   * The resolved settings to be applied to the slideshow
   * @type {Object}
   */
  var options = $.extend(defaults, opts || {});

  /**
   * Stores all the animation objects that come pre-built with the plugin.
   * Each animation should either be a function or an object containing two
   * functions (forward & backward). All functions are passed 3 variables
   * $newSlide, $oldSlide, $slides.
   *
   * @type {Object}
   */
  var animations = {

    /**
     * No animation is performed, just the classes are changed out on the slides.
     * Useful if the animation will be handled via CSS transitions.
     */
    none: function($newSlide, $oldSlide) {
      $oldSlide.removeClass(options.currentClass);
      $newSlide.addClass(options.currentClass);
    },

    /**
     * The new slide fades in on top of the old slide.
     */
    fade: function($newSlide, $oldSlide, $slides) {
    	$oldSlide.css('z-index', '1');
    	$newSlide.css('z-index', '2').fadeIn(options.speed, function() {
    		$oldSlide.removeClass(options.currentClass).fadeOut(0);
    		$newSlide.addClass(options.currentClass);
    	});
    },

    /**
     * The new slide fades in as the old slide fades out
     */
  	fadeInOut: function($newSlide, $oldSlide, $slides) {
  		$oldSlide.css('z-index', '1').fadeOut(options.speed, function() { $oldSlide.removeClass(options.currentClass); });
  		$newSlide.css('z-index', '2').fadeIn(options.speed, function() { $newSlide.addClass(options.currentClass); });
  	},

    /*
    ** The new slide pushes the old slide off screen as it arrives
    ** Requires slides to be positioned absolutely
    */
  	push: {

      leftPositive: { left: '100%'  },
      leftNegative: { left: '-100%' },
      leftZero:     { left: '0%'    },

  		forward: function($newSlide, $oldSlide, $slides) {
  			$oldSlide.animate({ left: '-100%' }, options.speed, 'easeInOutExpo', function() {
  				$oldSlide.removeClass(options.currentClass).css({ left: '100%'  }).appendTo($slides);
  			});
				$newSlide.animate({ left: '0%'    }, options.speed, 'easeInOutExpo', function() {
					$newSlide.addClass(options.currentClass);
				});
  		},

  		backward: function($newSlide, $oldSlide, $slides) {
				$oldSlide.animate({ left: '100%'  } , options.speed, 'easeInOutExpo', function() {
  				$oldSlide.removeClass(options.currentClass);
  			});
				$newSlide.css({ left: '-100%' }).animate({ left: '0%'    }, options.speed, 'easeInOutExpo', function() {
					$newSlide.addClass(options.currentClass);
				});
  		}

  	},

    /*
    ** Slide container is pulled over distance of slide width
    **
    ** Requires slides to be floated inside a very wide div.
    ** Or cells in a table if you place no value on your soul.
    ** Or I supposed they could be inline-block.
    ** Really, as long as they're side-by-side.
    */
  	pull: {

  		forward: function($newSlide, $oldSlide, $slides) {
  			$slides.animate({ 'margin-left': '-'+$oldSlide.width()+'px' }, options.speed, 'easeInOutExpo', function() {
  				$oldSlide.removeClass(options.currentClass).appendTo($slides);
  				$slides.css({ 'margin-left': '0px'  });
  				$newSlide.addClass(options.currentClass);
  			});
  		},

  		backward: function($newSlide, $oldSlide, $slides) {
  			$slides.css({ 'margin-left': '-'+$newSlide.width()+'px' });
 				$newSlide.prependTo($slides);
  			$slides.animate({ 'margin-left': '0px' }, options.speed, 'easeInOutExpo', function() {
  				$oldSlide.removeClass(options.currentClass);
  				$newSlide.addClass(options.currentClass);
  			});
  		}

  	}

  };

	/////////////////////////////////////////////////////////////////////////////
	// SETUP & HELPER FUNCTIONS
	/////////////////////////////////////////////////////////////////////////////

  /**
   * Conistent generator for a data attribute selector
   * @access public
   * @param  {String} name The name of the data attribute
   * @return {String}      The properly prefixed data attribute
   */
  var dataSelector = function(name) {
    return 'data-{0}'.f(name);
  };

  /**
   * Consistent generator for the counter selector
   *
   * @access public
   * @param  {Integer} counter The current slide counter to reach
   * @return {String}          The counter selector
   */
  var counterSelector = function(counter) {
    return '[{0}={1}]'.f(dataSelector(options.counter), counter);
  };

  /**
   * Consistent generator for the current slide selector
   * @access public
   * @return {String} The current slide selector
   */
  var currentSlideSelector = function() {
    return '{0}.{1}'.f(options.slide, options.currentClass);
  };

  /**
   * Gets or sets the counter value for any element
   * @access public
   * @param  {jQuery Object} $this   The element to get or set the counter value for
   * @param  {Integer} val           The value to set the counter to (leave undefined to get current value)
   * @return {Integer|jQuery Object} Either the current value or $this if val is provided
   */
  var theCounter = function($this, val) {
    var selector = dataSelector(options.counter);
  	if (val === undefined) return parseInt($this.attr(selector));
  	else return $this.attr(selector, val);
  };

  /**
   * Gets or sets the count value for any element
   * @access public
   * @param  {jQuery Object} $this   The element to get or set the count value for
   * @param  {Integer} val           The value to set the count to (leave undefined to get current value)
   * @return {Integer|jQuery Object} Either the current value or $this if val is provided
   */
  var theCount = function($this, val) {
    var selector = dataSelector(options.count);
  	if (val === undefined) return parseInt($this.attr(selector));
  	else return $this.attr(selector, val);
  };

  /**
   * Applies a counter to the slides or slide navigator.
   * This function can start a chain.
   *
   * @access public
   * @param  {jQuery Object} $slides The collection of slides
   * @return {jQuery Object}         The passed collection
   */
  var applyCounter = function($slides) {
  	var counter = 0;
  	$slides.each(function(){ theCounter($(this), counter++); })
  		.removeClass(options.currentClass)
  		.first().addClass(options.currentClass);
  };

	/////////////////////////////////////////////////////////////////////////////
	// ANIMATION HANDLERS
	/////////////////////////////////////////////////////////////////////////////

  /**
   * Resolves the animation to be applied to the slides.
   *
   * @access public
   * @param  {String|Function|Object} style     Name of the transition to apply or a custom transition function/obj
   * @param  {Boolean}                isForward Whether or not the transition progresses forward or backwards
   * @return {Mixed}                            The animation function to be applied to the slides
   */
  var getAnimation = function(style, isForward) {
  	var direction = isForward ? 'forward' : 'backward';
  	if (typeof style === 'string')   style = animations[style];
  	if (typeof style === 'object')   return style[direction];
  	if (typeof style === 'function') return style;
  	return undefined;
  };

  /**
   * Runs the animation on the slides.
   *
   * @access public
   * @param  {jQuery Object}          $slides   The deck of slides
   * @param  {Integer}                counter   The counter value for the new slide
   * @param  {Boolean}                isForward Whether or not the transition progresses forward or backwards
   * @param  {String|Function|Object} style     The transition style to use in the animation
   */
  var animate = function($slides, counter, isForward, style) {
  	var $oldSlide = $slides.find(currentSlideSelector());
  	var $newSlide = $slides.find(options.slide+counterSelector(counter));
  	var $toMove   = isForward ? $newSlide.prevAll() : $newSlide.nextAll();

		if ($oldSlide.get(0) === $newSlide.get(0)) return;

  	getAnimation(style, isForward)($newSlide, $oldSlide, $slides);
  };

  /**
   * Set the navigator to the correct counter
   * @access public
   * @param  {jQuery Object} $navigator The slide navigator container
   * @param  {Integer} counter          The slide counter that should be set
   */
  var setNavigator = function($navigator, counter) {
  	$navigator.find(options.slideNavElement).removeClass(options.currentClass)
  		.filter(counterSelector(counter)).addClass(options.currentClass);
  };

	/////////////////////////////////////////////////////////////////////////////
	// EVENT HANDLERS
	/////////////////////////////////////////////////////////////////////////////

  /**
   * Progress slideshow to the supplied counter
   * @access public
   * @param  {jQuery Object}  $this      The slideshow container
   * @param  {jQuery Object}  $slides    The slides
   * @param  {jQuery Object}  $secondary The secondary slides
   * @param  {jQuery Object}  $nav       The slide navigator
   * @param  {Integer}        counter    The slide counter that should be set
   * @param  {Boolean}        isForward  Whether or not the animation should transition forward or in reverse
   */
	var goTo = function($this, $slides, $secondary, $nav, counter, isForward) {
		var count = theCount($this);
    if (count === 0) return;

    //force counter into bounds of slide indeces
		while (counter < 0)      counter += count;
		while (counter >= count) counter -= count;

		animate($slides, counter, isForward, options.style);

		if ($secondary.length)
      animate($secondary, counter, isForward, options.secondaryStyle);

    if ($nav.length)
      setNavigator($nav, counter);

		theCounter($this, counter);
	};

  /**
   * Progress slideshow by one slide
   * @access public
   * @param  {jQuery Object}  $this      The slideshow container
   * @param  {jQuery Object}  $slides    The slides
   * @param  {jQuery Object}  $secondary The secondary slides
   * @param  {jQuery Object}  $nav       The slide navigator
   * @param  {Boolean}        isForward  Whether or not the step should be backwards or forwards in slide deck
   */
	var step = function($this, $slides, $secondary, $nav, isForward) {
		var counter = theCounter($this) + (isForward ? 1 : -1);
		goTo($this, $slides, $secondary, $nav, counter, isForward);
	};

  /**
   * Gets the tick function used by the setInterval that runs the slideshow
   *
   * @access public
   * @param  {jQuery Object}  $this      The slideshow container
   * @param  {jQuery Object}  $slides    The slides
   * @param  {jQuery Object}  $secondary The secondary slides
   * @param  {jQuery Object}  $nav       The slide navigator
   * @return {Function}                  The setInterval callback for stepping through the slides
   */
	var getTickFunction = function($this, $slides, $secondary, $nav) {
		return function() { step($this, $slides, $secondary, $nav, true); }
	};

  /////////////////////////////////////////////////////////////////////////////
  // THE LOOP
  /////////////////////////////////////////////////////////////////////////////

  return this.each(function() {

	/////////////////////////////////////////////////////////////////////////////
	// INITIALIZATION
	/////////////////////////////////////////////////////////////////////////////

	var $this      = $(this);
  	var $slides    = $this.find(options.slides);
  	var $secSlides = $this.find(options.secondarySlides);
  	var $navigator = $this.find(options.slideNav);

  	theCount($this, $slides.find(options.slide).length);
  	theCounter($this, 0);

  	applyCounter($slides.find(options.slide));
  	applyCounter($secSlides.find(options.slide));
  	applyCounter($navigator.find(options.slideNavElement));

  /////////////////////////////////////////////////////////////////////////////
	// TIMER SETUP
	/////////////////////////////////////////////////////////////////////////////

    /**
     * The setInterval ID for the slide transition timer
     * @type {Integer}
     */
		var timer;

    /**
     * Starts the slide transition timer
     * @access public
     */
		var startTimer = function() {
			timer = setInterval(
				getTickFunction($this, $slides, $secSlides, $navigator),
				options.duration
			);
		};

    /**
     * Stops the slide transition timer
     * @access public
     */
		var stopTimer = function() { clearInterval(timer); };

  /////////////////////////////////////////////////////////////////////////////
	// EVENT BINDINGS
	/////////////////////////////////////////////////////////////////////////////

  /**
   * Repeated actions for a click event on the slideshow
   * Some of this ought to be condensed. A lot of repeated lines here
   *
   * @access public
   * @param  {Object}   e        The click event object
   * @param  {Function} callback The event-specific callback to be performed
   */
  var clickEvent = function(e, callback) {
    e.preventDefault();
    stopTimer();
    callback();
    // Comment out this line to prevent auto-advance after user interaction
    // Someone please make this an option. Should't just be commented out like this
    //startTimer();
  };

	// Next button
	$this.on('click', options.nextButton, function(e) {
    clickEvent(e, function(){
      if (!$(options.slides).add(options.slides + ' *').is(':animated')) {
      step($this, $slides, $secSlides, $navigator, true);
      }
    });
	});

	// Previous button
	$this.on('click', options.prevButton, function(e) {
    clickEvent(e, function(){
    	if (!$(options.slides).add(options.slides + ' *').is(':animated')) {
      	step($this, $slides, $secSlides, $navigator, false);
      }
    });
	});

	// Any slide counter link
	$navigator.on('click', options.slideNavElement, function(e) {
    clickEvent(e, function(){
      if (!$(options.slides).add(options.slides + ' *').is(':animated')) {
      	goTo($this, $slides, $secSlides, $navigator, theCounter($(e.target)), true);
      }
    });
	});

	// Swipe events require jQuery Mobile

	// Swipe advance
	$this.on('swipeleft', function(e) {
    clickEvent(e, function(){
      if (!$(options.slides).add(options.slides + ' *').is(':animated')) {
      step($this, $slides, $secSlides, $navigator, true);
      }
    });
	});

	// Swipe retreat
	$this.on('swiperight', function(e) {
    clickEvent(e, function(){
    	if (!$(options.slides).add(options.slides + ' *').is(':animated')) {
      	step($this, $slides, $secSlides, $navigator, false);
      }
    });
	});

  /////////////////////////////////////////////////////////////////////////////
	// ... AND BEGIN
	/////////////////////////////////////////////////////////////////////////////

	startTimer();

  /////////////////////////////////////////////////////////////////////////////
  // EOF
  /////////////////////////////////////////////////////////////////////////////

  });

};
})(jQuery, window);