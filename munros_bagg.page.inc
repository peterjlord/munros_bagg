<?php
function munros_page_edit() {

}
function munros_bagg_change_area_form_load_view($uid) {
	$return = array();
	$view = views_get_view('munros_users_list');
  $view->set_display('page');
  if(arg(0)== 'node') {
    $view->set_arguments(array($uid));
  }
  $view->set_items_per_page(283);
  //$view->set_items_per_page(16);
  $view->preview();
	foreach($view->result as $key => $munro) {
		$return[$munro->nid] = $munro;
	}	
	return $return;
}
function munros_bagg_form($form, $form_state = array()) {
	$munros_list  = munros_bagg_change_area_form_load_view($uid);

	$munros_bagged = array();
  $form['munros_filter'] = array('#tree' => TRUE);

  $form['munros_filter'] = array(
    '#tree' => TRUE,
    '#weight' => -1
  );
  $form['munros_filter']['munro_name'] = array(
    '#type' => 'textfield',
		'#size' => 26,
    '#title' => t('Filter Munros')
  );

  $form['munros_filter']['show'] = array(
    '#type' => 'checkboxes',
    '#default_value' => array('bagged', 'notbagged'),
    '#options' => array('bagged' => t('Bagged'), 'notbagged' => t('Not Bagged')),
    '#prefix' => '<div id="munro-filter-show-wrapper">',
    '#suffix' => '</div>'
  );
  foreach($munros_list as $munro) {
    $area = $munro->field_field_area[0]['raw']['node']->title;
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
        t('Order'),
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
  $form['#theme'] = 'munros_bagg_munros';
  uasort($munros, 'munros_bagg_sort_by_order');

  // Replace the $form['modules'] with our $modules array.
  $form['munros'] = $munros;

  // Add our $tab_counts array to the form.
  $form['#tab_counts'] = $tab_counts;


  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => 'submit',
  );
  // Change to include theme in here
	// Uncomment / Comment to get dsm in submit function
	$form['actions']['submit']['#submit'] = array('munros_bagg_form_submit');
  return $form;
}
function munros_bagg_form_validate($form, &$form_state) {
  // Validation logic.
}
function munros_bagg_flag_munros($areas) {
	$munros = array();
	global $user;
	$flag = flag_get_flag('baggedmunros') or die('no "baggedmunros" flag defined');
	foreach($areas as $area_id => $area) {
  	foreach($area as $munro_id => $munro) {
      extract($munro);
      if($bagged) {
				$munros[$munro_id] = $munro_id;
        $flag->flag('flag', $munro_id);
				foreach(flag_get_user_flags('node', $munro_id, $user->uid) as $munro_bagged) {
					// Get Bagging Id and update
					$bagging_id = $munro_bagged->flagging_id;
					munros_bagg_flag_munros_time($bagged_date, $bagging_id);
				}
      } else  {
        $flag->flag('unflag', $munro_id);
      }
    }
  }
	return $munros;
}
function munros_bagg_flag_munros_time($bagged_date, $bagging_id) {
	$a = strptime($bagged_date, '%Y-%m-%d');
  $bagged_date = mktime(0, 0, 0, $a['tm_mon']+1, $a['tm_mday'], $a['tm_year']+1900);
  $num_updated = db_update('flagging')
  	->fields(array(
    	'timestamp' => $bagged_date,
    ))
    ->condition('flagging_id', $bagging_id, '=')
    ->execute();
}
function munros_bagg_form_submit($form, &$form_state) {
  // Submission logic.
	$areas = ($form_state['values']['munros']);
	$munros = munros_bagg_flag_munros($areas);
	//munros_bagg_flag_munros_time($areas, $munros);
}
function _munros_bagg_build_row($munro, $extra) {
  $form = array(
    '#tree' => TRUE,  
  );                    
	 // Set the basic properties.
  $form['name'] = array(
    '#markup' => $munro->node_title,
  );
  $form['order'] = array(
    '#markup' => $munro->field_data_field_order_field_order_value,
  );
  $bagged = ($munro->flagging_node_timestamp == NULL) ? FALSE : TRUE;
  $bagged_time = $munro->flagging_node_timestamp;
  $form['bagged'] = array(
    '#type' => 'checkbox',
    '#title' => t('Bagged'),
    '#default_value' => $bagged,
  );
	if($bagged) {
		$bagged_time = format_date($bagged_time, 'custom', 'Y-m-d');	
	}
	$form['bagged_date'] = array(
		'#type' => 'date_popup',
  	'#default_value' => $bagged_time,
  	'#date_type' => DATE_DATETIME,
 	 	'#date_timezone' => date_default_timezone(),
  	'#date_format' => 'd/m/Y',
  	'#date_increment' => 1,
  	'#date_year_range' => '-30:+3',
	);
  return $form;
}
