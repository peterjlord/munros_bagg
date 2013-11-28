<?php

/**
 * @file
 *
 * @author peterjlord
 */

/**
 * A router theme function.
 *
 * Appropriately themes the system munros page with alterations and based on
 * set variables
 *
 * @param $form
 *   An associative array containing the structure of the form.
 *
 * @return
 *   An output string.
 */
function theme_munros_bagg_munros($variables) {
  $form = $variables['form'];

  drupal_add_css(drupal_get_path('module', 'munros_bagg') .'/css/munros_bagg.css');
  $output = '';
	drupal_add_css(drupal_get_path('module', 'munros_bagg') .'/css/munros_bagg_tab.css');
  drupal_add_js(drupal_get_path('module', 'munros_bagg') .'/js/munros_bagg_filter.js');
  drupal_add_js(drupal_get_path('module', 'munros_bagg') .'/js/munros_bagg_filter_tab.js');

  drupal_add_js(array('munroFilter' => array('visualAid' => variable_get('module_filter_visual_aid', 1))), 'setting');
  if (variable_get('module_filter_dynamic_save_position', 0)) {
  	drupal_add_js(drupal_get_path('module', 'module_filter') .'/js/dynamic_position.js');
  }

  $form['munros_filter']['#size'] = 45;
  $output .= theme('munros_bagg_tabs', $form);

  return $output;
}
/**
 * Theme callback for the munros tabbed form.
 */
function theme_munros_bagg_tabs($variables) {
  //dsm($variables);
	$output = '';
  $form = $variables['form'];

	$tabs    = munros_bagg_get_tabs($form);
	$filter	 =	 drupal_render($form['munros_filter']);
	$munros  =  drupal_render($form['munros']);
  $actions = drupal_render($form['actions']);
	
$output.=<<<EOD
<div id="munro-filter-wrapper">
<div id="munro-filter-wrapper">
	<div id="munro-filter-left">
	$tabs
	</div>
	<div id="munro-filter-right">
		<div id="munro-filter-squeeze">
		$filter
		$munros
		</div>
	</div>
</div>
</div>
EOD;
  $output .= drupal_render_children($form);
  return $output;
}
function theme_munros_bagg_table($variables) {
	//dsm($variables);
  $form = $variables['form'];

  // Individual table headers.
  $rows = array();
  // Iterate through all the munros, which are
  // children of this fieldset.
  foreach (element_children($form) as $key) {
    // Stick it into $munro for easier accessing.
    $munro = $form[$key];
    $row = array();
    unset($munro['bagged']['#title']);

    $row[] = array('class' => array('checkbox'), 'data' => drupal_render($munro['bagged']));

    $label = '<label';
    if (isset($munro['#id'])) {
      $label .= ' for="'. $munro['#id'] .'-bagged"';
    }
    $row[] = $label .'><strong>' . drupal_render($munro['name']) . '</strong></label>';
    $id = munros_bagg_get_id($munro['#area']);
		
    $row[] = array('class' => array('date'), 'data' => drupal_render($munro['bagged_date']));
    $row[] = array('class' => array('order'), 'data' => drupal_render($munro['order']));
    $rows[] = array(
      'data' => $row,
      'class' => array($id .'-tab-content')
    );
  }
  return theme('table', array('header' => $form['#header'], 'rows' => $rows, 'attributes' => array('class' => array('area'))));
}
function munros_bagg_get_tabs($form) {
  $count_enabled = TRUE;
	$all = t('All');
  $all_count = ($count_enabled) ? '<span class="counts">' . t('!enabled of !total', array('!enabled' => $form['#tab_counts'][$all]['bagged'], '!total' => $form['#tab_counts'][$all]['total'])) . '</span>' : '';
  $tabs = array('all' => '<li class="active"><a id="all-tab" class="project-tab overlay-exclude" href="#all">' . $all . $all_count . '</a></li>');
  foreach ($form['#areas'] as $area) {
    $id = munros_bagg_get_id($area);

    $count = ($count_enabled) ? '<span class="counts">' . t('!enabled of !total', array('!enabled' => $form['#tab_counts'][$area]['bagged'], '!total' => $form['#tab_counts'][$area]['total'])) . '</span>' : '';
    $tabs[$id] = '<li><a id="' . $id . '-tab" class="project-tab overlay-exclude" href="#' . str_replace('-', '_', $id) . '">' . $area . $count . '</a></li>';
  }
	return '<ul>'. implode($tabs) . '</ul>';
}
function munros_bagg_get_id($text) {
  $id = strtolower($text);
  return preg_replace('/([^a-z])([\/(  )])*/', '-', $id);
}
