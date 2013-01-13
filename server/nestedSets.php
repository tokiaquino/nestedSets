<?php
	error_reporting(0);
	header('Access-Control-Allow-Origin: *');
	require_once 'database/PostgreSqlDB.php';
	
	
	$db = new PostgreSqlDB("database/nestedSet.inc");
	if(count($_GET) > 0){
		$task = $_GET['t'];
		switch ($task){
			case "all":
				/*
				 * ordeno por el lft, para que al armar
				 * en javascript siempre se encuentre el primero
				 * hijo, primero (o sino se complica demasiado 
				 * la creacion del grafico)
				 */
				$sql = "SELECT t.id id, t.node nodeText, t.lft lft, t.rgt rgt, t.depth depth
				  		  FROM tree t
				  		  ORDER BY lft";
				break;
		}
		
		echo json_encode($db->queryInArray($sql));
	}
	
	if(count($_POST) > 0){
		$task = $_POST['t'];
		switch ($task){
			case "s":
				try{
					$sqls = array();
					$jsonData = json_decode($_COOKIE["treeValue"], true);
					$notDeleteId = "";
					foreach ($jsonData as $json){
						if( !isset($json['id']) || $json['id'] == null){
							$sqls[] = "INSERT INTO tree (id, node, lft, rgt, depth) VALUES (nextval('node_id_seq'), '".pg_escape_string ($json['nodetext'])."', ".$json['lft'].", ".$json['rgt'].", ".$json['depth'].");";
						}else{
							$notDeleteId .= $json['id'].", ";
							$sqls[] = "UPDATE tree SET node = '". pg_escape_string($json['nodetext'])."', lft = ".$json['lft'].", rgt = ".$json['rgt'].", depth = ".$json['depth']." WHERE id = ".$json['id'].";";
						}
					}
					$notDeleteId = substr($notDeleteId, 0, strlen($notDeleteId)-2);
					
					$idsToDelete = $db->queryInArray("SELECT id FROM tree WHERE id NOT IN($notDeleteId)");
					$ids = "";
					foreach ($idsToDelete as $key => $value){
						$ids .= $value['id'].", ";
					}
					if(strlen($ids) > 2){
						$ids = substr($ids, 0, strlen($ids)-2);					
						$sqls[] = "\n\nDELETE FROM tree WHERE id  in ($ids);";
					}
					
					
					if($db->transactions($sqls)){
						echo "ok";
					}
					
				} catch (Exception $e){
					echo $e;
				}
				break;
		}
	}  
?>