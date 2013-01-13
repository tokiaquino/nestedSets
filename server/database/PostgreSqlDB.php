<?php 
	class PostgresException extends Exception {
	    function __construct($msg) { parent::__construct($msg); }
	}
	
	class DependencyException extends PostgresException {
	    function __construct() { parent::__construct("deadlock"); }
	}

	class PostgreSqlDB {
		private $host;
		private $port;
		private $dbname;
		private $user;
		private $password;
		private $connecStr;
		private $resourceConexion;
		private $error;
		

		/**
		 * 
		 * Enter description here ...
		 * @param string $fileParam El fileParam es el path de un archivo de configuracion. Puede ser nulo en el caso de querer pasar los parametros detalladamente  
		 * @param string $host El host es donde esta alojada la Base de Datos 
		 * @param string $port El port es puerto donde escucha la Base de Datos
		 * @param string $dbname El dbname es el nombre de la Base de Datos a la cual desea conectarse
		 * @param string $user usuario de la base de datos
		 * @param string $password password de la base de datos
		 * @param boolean $connectType Fuerza una nueva conexion
		 * @access public
		 * @author Toki Aquino
		 */
		function __construct($fileParam, $host, $port, $dbname, $user, $password, $connectType = false){
			$connStr = "";
			if($fileParam){ // se conecta con los parametros en un archivos de configuracion
				fopen($fileParam, "rb");
				$arr = file($fileParam);
				foreach ($arr as $line){
					list($param, $value) = explode("=", $line);
					$connStr .= " ".$param."=".$value;
				}
			}else{ // en el caso que se setee los datos de a uno
				$connStr .= isset($host) ? "host=$host " : " ";
				$connStr .= isset($port) ? "port=$port " : " ";
				$connStr .= isset($dbname) ? "dbname=$dbname " : " ";
				$connStr .= isset($user) ? "user=$user " : " ";
				$connStr .= isset($password) ? "password=$password" : "";
			}
			$this->connecStr = $connStr;
			//$this->resourceConexion =  pg_connect($this->connecStr);
			if($connectType){
				$this->resourceConexion =  pg_connect($this->connecStr, PGSQL_CONNECT_FORCE_NEW);
			}else {
				$this->resourceConexion =  pg_connect($this->connecStr);
			}
		}
		
		function __destruct(){
			pg_close($this->resourceConexion);
		}
		
		/**
		 * Enter description here ...
		 * @param resource $result El result es un query result resource a partir del cual se generara un array
		 */
		public function convertirAArray($result){
			$arrResult = array();
			$numFiels = pg_num_fields($result);
			while ($o = pg_fetch_object($result)){//recorro cada fila del resultado
				$arrRow = array();
				for($field = 0; $field < $numFiels; $field++){ // recorro cada columna de la fila
					$fieldname = pg_field_name($result, $field);
					$arrRow[$fieldname] = $o->$fieldname;
				}
				$arrResult[] = $arrRow;
			}
			return $arrResult;
		}
		
		public function query($sql){
			$result = @pg_query($this->resourceConexion, $sql);
			if($result === false){
				$error = pg_last_error($this->resourceConexion);
				if(stripos($error, "deadlock detected") !== false){
					throw (new DependencyException()); 
				}else{
					throw (new PostgresException($error));
				}
			}
			return $result;
		}
		
		public function transactions($sqls){
			$strTransactions = "";
			do{
				$repeat = false;
				try {
					$this->query("begin;");
					for($i = 0; $i < count($sqls);  $i++){ 
						$this->query($sqls[$i]);
					}
					$this->query("commit;");
				} catch (DependencyException $e){
					$this->query("rollback;");
					$repeat = true;
					return $e;
				}
				
			}while ($repeat);
			return true;
		}
		
		public function queryInArray($sql){
			return $this->convertirAArray($this->query($sql));
		}
		
		public function getHost(){
			return $this->host; 
		}
		
		public function setHost($host){
			$this->host = $host; 
		}
		
		public function getPort(){
			return $this->port;
		}
		
		public function setPort($port){
			$this->port = $port;
		}
		
		public function getDbName(){
			return $this->dbname;
		}
		
		public function setDbName($dbName){
			$this->dbname = $dbName;
		}
		
		public function getUser(){
			return $this->user;
		}
		
		public function setUser($user){
			$this->user = $user;
		}
		
		public function getPassword(){
			return $this->password;
		}
		
		public function setPassword($password){
			$this->password = $password;
		}
		
		public function getConexionString(){
			return $this->connecStr;
		}
		
		public function getResourceConexion(){
			return $this->resourceConexion;
		}
		
		public function getError(){
			return $this->error;
		}
		

	}
	
