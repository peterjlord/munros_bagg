<?php
function munros_page_edit() {

}
function munros_bagg_change_area_form_load_view() {
	$view = views_get_view('munros_users_list');
  $view->set_display('page');
  if(arg(0)== 'node') {
    $view->set_arguments(array($a1));
  }
  $view->set_items_per_page(283);
  $view->preview();
	return $view->result;
}
function munros_bagg_change_area_form() {
	$munros = array();
	$munros_list	=	munros_bagg_change_area_form_load_view();
	/*
	foreach($munros_list as $key => $value) {
		$munros[$value->nid] = $value;
	}
	uasort($munros, 'munros_bagg_sort_by_order');
	

	$munros_bagged = array();
	$form['munros'] = array('#tree' => TRUE);
	foreach ($munros as $nid => $munro) {
		$area = $munro->field_field_area[0]['raw']['node']->title;
		$form['munros'][$area][$munro->nid] = _munros_bagg_build_row($munro, $extra);
	}

  foreach (element_children($form['munros']) as $area) {
    $form['munros'][$area] += array(
      '#type' => 'fieldset',
      '#title' => t($area),
      '#collapsible' => TRUE,
      '#theme' => 'system_modules_fieldset',
      '#header' => array(
        array('data' => t('Enabled'), 'class' => array('checkbox')),
        t('Name'),
        t('Version'),
        t('Description'),
        array('data' => t('Operations'), 'colspan' => 3),
      ),
      // Ensure that the "Core" package fieldset comes first.
      '#weight' => $area == 'Core' ? -10 : NULL,
    );
  }
	*/

	$form['munro_filter'] = array('#tree' => TRUE);

 	$form['munro_filter'] = array(
    '#tree' => TRUE,
    '#weight' => -1
  );
  $form['munro_filter']['munro_name'] = array(
    '#type' => 'textfield',
		'#name' => 'munro_name',
		'#size' => '30',
    '#title' => t('Filter Munros')
  );

  $form['munro_filter']['show'] = array(
    '#type' => 'checkboxes',
    '#default_value' => array('bagged', 'notbagged'),
    '#options' => array('bagged' => t('Bagged'), 'notbagged' => t('Not Bagged')),
    '#prefix' => '<div id="munro-filter-show-wrapper">',
    '#suffix' => '</div>'
  );
	foreach($munros_list as $munro) {
		$area	=	$munro->field_field_area[0]['raw']['node']->title;
		$form['munros'][$area][$munro->nid] = _munros_bagg_build_row($munro, $extra);
  }
	// Remove the fieldsets for each package since we will be using tabs
  // instead. Put all modules into one array.
  $munros = array(
      '#theme' => 'munros_bagg_table',
      '#header' => array(
        array('data' => t('Bagged'), 'class' => 'checkbox'),
        t('Munro'),
        array('data' => t('Date'), 'class' => 'date'),
        //t('Order'),
      )
    );
	$all = t('All');
  $tab_counts = array($all => array('id' => 'all', 'bagged' => 0, 'total' => 0));
  $form['#areas'] = array();
	foreach (element_children($form['munros']) as $area) {
		$form['#areas'][$area] = $area;
		if (!isset($tab_counts[$area])) {
    	$tab_counts[$area] = array('enabled' => 0, 'total' => 0);
    }
		foreach (element_children($form['munros'][$area]) as $munro) {
    	$tab_counts[$all]['total']++;
      $tab_counts[$area]['total']++;
      if (!empty($form['munros'][$area][$munro]['bagged']['#default_value'])) {
      	$tab_counts[$all]['bagged']++;
        $tab_counts[$area]['bagged']++;
      }

      $munros[$munro] = $form['munros'][$area][$munro];
      $munros[$munro]['#area'] = $area;
      $munros[$munro]['#parents'] = array('munros', $area, $munro);
    }
  }
	// Sort the array of modules alphabetically.
  uasort($munros, 'munros_bagg_sort_by_order');

  // Replace the $form['modules'] with our $modules array.
  $form['munros'] = $munros;

  // Add our $tab_counts array to the form.
  $form['#tab_counts'] = $tab_counts;


  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Update your munros'),
  );
	// Change to include theme in here
	dsm($form);	
	$form['#theme'] = 'munros_bagg_munros';


  return $form;
}
function _munros_bagg_build_row($munro, $extra) {
  $form = array(
    '#tree' => TRUE,  
  );                    
  // Set the basic properties.
  $form['name'] = array(
    '#markup' => $munro->node_title,
  );
  $bagged = ($munro->flagging_node_timestamp == NULL) ? FALSE : TRUE;
	$bagged_time = $munro->flagging_node_timestamp;
  $form['bagged'] = array(
    '#type' => 'checkbox',
    '#title' => t('Bagged'),
		'#value' => $munro->nid,
		'#checked' => $bagged,
		'#attributes' => array(
			'id' => 'munro-' . $munro->nid,
		),
    '#default_value' => $bagged,
  );
	$format = 'Y-m-d';
	$form['bagged_date'] = array(
		'#type' => 'textfield',
		'#size' => 10,
		'#title' => "Year of birth",
		'#description' => 'Format is "YYYY"',
	);
  return $form;
}

function munros_bagg_change_area_form_submit() {

}
