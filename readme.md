Plugin Info
=====

REQUIRES JQUERY-UI-EFFECTS CORE TO DO PUSH-PULL ANIMATION

This plugin is designed to quickly create jQuery slideshows with minimal configuration. Currently the config options are:

```php
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
```

- slides: The container of elements you are wanting to slide back and forth

- secondarySlides: Alternate slides container you want to slide in sync with the main slides. Slides in this must have the same class that is set in the "slide" option.

- slide: The class name of each slide within the "slides" option container (also applies to alternate slides).

- slideNav: The class name of the slide nav container (contains the navigation "dots", NOT the next and previous buttons)

- slideNavElement: the element within the slidenav to control navigation.

- nextButton: The class of the next button (NOT PART OF slideNav)

- prevButton: The class of the previous button (NOT PART OF slideNav)

- duration: The time each slide stays visible

- speed: The speed of each transition

- style: The type of animation to perform. Values are: 'none', 'fade', 'fadeInOut', 'push', and 'pull'

- secondaryStyle: The type of animation for the secondary slides. Values are same as main "style" option.

- currentClass: The class to add to the currently visible slide

- counter: the name of the data attribute (data-counter='') to append to elements. Stores the # of the current item displayed.

- count: the name of the data attribute (data-count='') to append to parent container. Stores the total # of slides.