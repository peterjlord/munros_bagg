
(function ($) {
  Drupal.MunroFilter = Drupal.MunroFilter || {};
  Drupal.MunroFilter.textFilter = '';
  Drupal.MunroFilter.timeout;
  Drupal.MunroFilter.tabs = {};
  Drupal.MunroFilter.enabling = {};
  Drupal.MunroFilter.disabling = {};

  Drupal.behaviors.munroFilter = {
    attach: function() {
      // Set the focus on the munro filter textfield.
      $('input[name="munros_filter[munro_name]"]').focus();

      $('#munro-filter-squeeze').css('min-height', $('#munro-filter-tabs').height());

      $('#munro-filter-left a.project-tab').each(function(i) {
        Drupal.MunroFilter.tabs[$(this).attr('id')] = new Drupal.MunroFilter.Tab(this);
      });

      // Move anchors to top of tabs.
      $('a.anchor', $('#munro-filter-left')).remove().prependTo('#munro-filter-tabs');

      $('input[name="munros_filter[munro_name]"]').keyup(function(e) {
        switch (e.which) {
          case 13:
            if (Drupal.MunroFilter.timeout) {
              clearTimeout(Drupal.MunroFilter.timeout);
            }

            Drupal.MunroFilter.filter(Drupal.MunroFilter.textFilter);
            break;
          default:
            if (Drupal.MunroFilter.textFilter != $(this).val()) {
              Drupal.MunroFilter.textFilter = this.value;
              if (Drupal.MunroFilter.timeout) {
                clearTimeout(Drupal.MunroFilter.timeout);
              }
              Drupal.MunroFilter.timeout = setTimeout('Drupal.MunroFilter.filter("' + Drupal.MunroFilter.textFilter + '")', 500);
            }
            break;
        }
      });
      $('input[name="munros_filter[munro_name]"]').keypress(function(e) {
        if (e.which == 13) e.preventDefault();
      });

      Drupal.MunroFilter.showBagged = $('#edit-munros-filter-show-bagged').is(':checked');
      $('#edit-munros-filter-show-bagged').change(function() {
        Drupal.MunroFilter.showBagged = $(this).is(':checked');
				//alert($('input[name="show[bagged]"]').val());
        Drupal.MunroFilter.filter($('input[name="munros_filter[show][bagged]"]').val());
      });
      Drupal.MunroFilter.showNotBagged = $('#edit-munros-filter-show-notbagged').is(':checked');
      $('#edit-munros-filter-show-notbagged').change(function() {
        Drupal.MunroFilter.showNotBagged = $(this).is(':checked');
        Drupal.MunroFilter.filter($('input[name="munros_filter[show][notbagged]"]').val());
      });
      if (Drupal.settings.munroFilter.visualAid == 1) {
        $('table.area tbody td.checkbox input').change(function() {
          if ($(this).is(':checked')) {
            Drupal.MunroFilter.updateVisualAid('enable', $(this).parents('tr'));
          }
          else {
            Drupal.MunroFilter.updateVisualAid('disable', $(this).parents('tr'));
          }
        });
      }

      // Check for anchor.
      var url = document.location.toString();
      if (url.match('#')) {
        // Make tab active based on anchor.
        var anchor = '#' + url.split('#')[1];
        $('a[href="' + anchor + '"]').click();
      }
      // Else if no active tab is defined, set it to the all tab.
      else if (Drupal.MunroFilter.activeTab == undefined) {
        Drupal.MunroFilter.activeTab = Drupal.MunroFilter.tabs['all-tab'];
      }
    }
  }

  Drupal.MunroFilter.visible = function(checkbox) {
    if (checkbox.length > 0) {
      if (Drupal.MunroFilter.showBagged) {
        if ($(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
          return true;
        }
      }
      if (Drupal.MunroFilter.showNotBagged) {
        if (!$(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
          return true;
        }
      }
    }
    return false;
  }

  Drupal.MunroFilter.filter = function(string) {
		if(string == 'bagged' || string == 'notbagged') string = '';
    var stringLowerCase = string.toLowerCase();
    var flip = 'odd';

    if (Drupal.MunroFilter.activeTab.id == 'all-tab') {
      var selector = 'table.area tbody tr td label > strong';
    }
    else {
      var selector = 'table.area tbody tr.' + Drupal.MunroFilter.activeTab.id + '-content td label > strong';
    }

    $(selector).each(function(i) {
      var $row = $(this).parents('tr');
      var munro = $(this).text();
      var munroLowerCase = munro.toLowerCase();
      if (munroLowerCase.match(stringLowerCase)) {
        if (Drupal.MunroFilter.visible($('td.checkbox :checkbox', $row))) {
          $row.removeClass('odd even');
          $row.addClass(flip);
          $row.show();
          flip = (flip == 'odd') ? 'even' : 'odd';
        }
        else {
          $row.hide();
        }
      }
      else {
        $row.hide();
      }
    });
  }

  Drupal.MunroFilter.Tab = function(element) {
    this.id = $(element).attr('id');
    this.element = element;

    $(this.element).click(function() {
      Drupal.MunroFilter.tabs[$(this).attr('id')].setActive();
    });
  }

  Drupal.MunroFilter.Tab.prototype.setActive = function() {
    if (Drupal.MunroFilter.activeTab) {
      $(Drupal.MunroFilter.activeTab.element).parent().removeClass('active');
    }
    // Assume the default active tab is #all-tab. Remove its active class.
    else {
      $('#all-tab').parent().removeClass('active');
    }

    Drupal.MunroFilter.activeTab = this;
    $(Drupal.MunroFilter.activeTab.element).parent().addClass('active');
    Drupal.MunroFilter.activeTab.displayRows();

    // Clear filter textfield and refocus on it.
    $('input[name="munro_filter[name]"]').val('');
    $('input[name="munro_filter[name]"]').focus();
  }

  Drupal.MunroFilter.Tab.prototype.displayRows = function() {
    var flip = 'odd';
    var selector = (Drupal.MunroFilter.activeTab.id == 'all-tab') ? 'table.area tbody tr' : 'table.area tbody tr.' + this.id + '-content';
		//alert(selector);
		//table.area tbody tr.loch-lomond-to-loch-tay-tab-content
    $('table.area tbody tr').hide();
    $('table.area tbody tr').removeClass('odd even');
    $(selector).each(function(i) {
      if (Drupal.MunroFilter.visible($('td.checkbox input', $(this)))) {
        $(this).addClass(flip);
        flip = (flip == 'odd') ? 'even' : 'odd';
        $(this).show();
      }
    });
  }

  Drupal.MunroFilter.Tab.prototype.updateEnabling = function(amount) {
    this.enabling = this.enabling || 0;
    this.enabling += amount;
    if (this.enabling == 0) {
      delete(this.enabling);
    }
  }

  Drupal.MunroFilter.Tab.prototype.updateDisabling = function(amount) {
    this.disabling = this.disabling || 0;
    this.disabling += amount;
    if (this.disabling == 0) {
      delete(this.disabling);
    }
  }

  Drupal.MunroFilter.Tab.prototype.updateVisualAid = function() {
    var visualAid = '';
    if (this.enabling != undefined) {
      visualAid += '<span class="enabling">' + Drupal.t('+@count', { '@count': this.enabling }) + '</span>';
    }
    if (this.disabling != undefined) {
      visualAid += '<span class="disabling">' + Drupal.t('-@count', { '@count': this.disabling }) + '</span>';
    }

    if (!$('span.visual-aid', $(this.element)).size() && visualAid != '') {
      $(this.element).prepend('<span class="visual-aid"></span>');
    }

    $('span.visual-aid', $(this.element)).empty().append(visualAid);
  }

  Drupal.MunroFilter.updateVisualAid = function(type, row) {
    // Find row class.
    var classes = row.attr('class').split(' ');
    for (var i in classes) {
      // Remove '-content' so we can use as id.
      var id = classes[i].substring(0, classes[i].length - 8);
      if (Drupal.MunroFilter.tabs[id] != undefined) {
        break;
      }
    }

    if (Drupal.MunroFilter.activeTab.id == 'all-tab') {
      var allTab = Drupal.MunroFilter.activeTab;
      var projectTab = Drupal.MunroFilter.tabs[id];
    }
    else {
      var allTab = Drupal.MunroFilter.tabs['all-tab'];
      var projectTab = Drupal.MunroFilter.activeTab;
    }

    var name = $('td label strong', row).text();
    switch (type) {
      case 'enable':
        if (Drupal.MunroFilter.disabling[id + name] != undefined) {
          delete(Drupal.MunroFilter.disabling[id + name]);
          allTab.updateDisabling(-1);
          projectTab.updateDisabling(-1);
          row.removeClass('disabling');
        }
        else {
          Drupal.MunroFilter.enabling[id + name] = name;
          allTab.updateEnabling(1);
          projectTab.updateEnabling(1);
          row.addClass('enabling');
        }
        break;
      case 'disable':
        if (Drupal.MunroFilter.enabling[id + name] != undefined) {
          delete(Drupal.MunroFilter.enabling[id + name]);
          allTab.updateEnabling(-1);
          projectTab.updateEnabling(-1);
          row.removeClass('enabling');
        }
        else {
          Drupal.MunroFilter.disabling[id + name] = name;
          allTab.updateDisabling(1);
          projectTab.updateDisabling(1);
          row.addClass('disabling');
        }
        break;
    }

    allTab.updateVisualAid();
    projectTab.updateVisualAid();
  }
})(jQuery);
