/**
 * 
 */
/*var nodes = [
		{id: 1,		nodeText: "Clothing",		lft: 1, 	rgt: 22, 	depth: 0},
		{id: 2, 	nodeText: "Men's", 			lft: 2, 	rgt: 9, 	depth: 1},
		{id: 3, 	nodeText: "Women's", 		lft: 10, 	rgt: 21, 	depth: 1},
		{id: 4,		nodeText: "Suits", 			lft: 3, 	rgt: 8, 	depth: 2},
		{id: 5, 	nodeText: "Slacks", 		lft: 4, 	rgt: 5, 	depth: 3},
		{id: 6, 	nodeText: "Jackets", 		lft: 6, 	rgt: 7, 	depth: 3},
		{id: 7, 	nodeText: "Dresses", 		lft: 11, 	rgt: 16,	depth: 2},
		{id: 8, 	nodeText: "Slirts", 		lft: 17, 	rgt: 18,	depth: 2},
		{id: 9, 	nodeText: "Blouses", 		lft: 19, 	rgt: 20, 	depth: 2},
		{id: 10, 	nodeText: "Evening Gowns", 	lft: 12, 	rgt: 13, 	depth: 3},
		{id: 11, 	nodeText: "Sun Dresses", 	lft: 14, 	rgt: 15,	depth: 3}
];*/
 
var nestedSetsUrl = rootUrl+"nestedSets.php";
var editTree;

function createNodeElement(nodeInfo){
	nodeDiv = document.createElement('div');
	if(nodeInfo.id != undefined){
		nodeDiv.setAttribute('id', 'node'+nodeInfo.id);		
	}
	nodeDiv.setAttribute('class', 'circle');
	nodeText = document.createElement('div');
	nodeText.setAttribute('class', 'nodeText');
	nodeText.appendChild(document.createTextNode(nodeInfo.nodetext));
	
	if(nodeInfo.id != undefined ){
		if(nodeText.attachEvent){
			nodeText.attachEvent("click", "showInfo("+nodeInfo.id+")");		
		}else{
			nodeText.setAttribute("onclick", "showInfo("+nodeInfo.id+")");
		}		
	}else{
		if(nodeText.attachEvent){
			nodeText.attachEvent("click", "showInfo(\""+nodeInfo.nodetext+"\", "+nodeInfo.lft+", "+nodeInfo.rgt+", "+nodeInfo.depth+")");		
		}else{
			nodeText.setAttribute("onclick", "showInfo(\""+nodeInfo.nodetext+"\", "+nodeInfo.lft+", "+nodeInfo.rgt+", "+nodeInfo.depth+")");
		}
	}
	
	
	spanLft = document.createElement('span');
	spanLft.setAttribute('class', 'lft');
	spanLft.appendChild(document.createTextNode(nodeInfo.lft));
	
	spanRgt = document.createElement('span');
	spanRgt.setAttribute('class', 'rgt');
	spanRgt.appendChild(document.createTextNode(nodeInfo.rgt));
	
	nodeDiv.appendChild(nodeText);
	nodeDiv.appendChild(spanLft);
	nodeDiv.appendChild(spanRgt);
	return nodeDiv;
}

/**
 * Cargo el arbol desde el servidor, y la setea en un cookie
 * desde la cual se trabajara (agregara, borrar, etc)hasta que se guarde en el servidor
 * y recien ahi deberia volver a llamar a esta funcion
 */
function init(){
	ajaxObj = new createXMLObject();
	ajaxObj.open("GET", nestedSetsUrl+"?t=all", true);
	ajaxObj.send();
	ajaxObj.onreadystatechange = function(){
		if(ajaxObj.readyState == 4 && ajaxObj.status == 200){
			nodes = JSON.parse(ajaxObj.responseText);
			nodes.forEach(function(el){
				el.id = parseInt(el.id);
				el.lft = parseInt(el.lft);
				el.rgt = parseInt(el.rgt);
				el.depth = parseInt(el.depth);
			});
			var expireDate = new Date();
			expireDate.setDate(expireDate.getDate()+1); // expira en 1 dia
			setCookie('treeValue', JSON.stringify(nodes));
			son = buildTree(nodes);
			removeAllChild(document.getElementById('showTree'));
			document.getElementById('showTree').appendChild(son);
		}
	};
	editTree = false;
}

function close(){
	//confirm("");
}

/**
 * Funcion recursiva que dibuja un arbol a partir de datos JSON
 * @returns Retorna un div en el cual esta dibujado el nodo padre, y dentro de este sus hijos y asi sucesivamente
 * @param tree Datos JSON, pude ser traidos del servidor o de una cookie
 */
function buildTree(tree, nodeRoot, endDepth){
	/*nodeRoot = typeof nodeRoot !== 'undefined' ? nodeRoot : null;
	endDepth = typeof endDepth !== 'undefined' ? endDepth : null;*/
	nodeRoot = typeof nodeRoot !== undefined ? nodeRoot : null;
	endDepth = typeof endDepth !== undefined ? endDepth : null;
	var currentDiv;
	
	if(nodeRoot == null ){
		tree.forEach(function(el){
			if(el.depth ==0 ){
				nodeRoot = el;
			}
		});
	}
	if(endDepth !== null){
		if(nodeRoot.depth > endDepth){
			return null;
		}
	}
	currentDiv = createNodeElement(nodeRoot);
	tree.forEach(function(itNode){
		if((nodeRoot.depth+1 == itNode.depth)  
				  && nodeRoot.lft < itNode.lft
				  && nodeRoot.rgt > itNode.rgt){			
					child = buildTree(tree, itNode, endDepth);
					if(child != null && child != undefined){
						currentDiv.appendChild(child);
					}
				}
	});
	return currentDiv;
}

/**
 * Retorna todos los hijos de node en treeNodes
 * @param treeNodes
 * @param node
 * @returns {Array}
 */
function searchChild(treeNodes, node){
	var returnTree = [];
	treeNodes.forEach(function(currentNode){
		if(node.lft < currentNode.lft
			&& node.rgt > currentNode.rgt
			&& node.depth+1 == currentNode.depth){
			returnTree.push(currentNode);
		}
	});
	return returnTree;
}

function loadForm(node){
	document.getElementById("selectedNodeTextValue").value=node.nodetext;
	document.getElementById("selectedNodeLftValue").value=node.lft;
	document.getElementById("selectedNodeRgtValue").value=node.rgt;
	document.getElementById("selectedNodeDepthValue").value=node.depth;
}

function cleanForm(){
	document.getElementById("selectedNodeTextValue").value=null;
	document.getElementById("selectedNodeLftValue").value=null;
	document.getElementById("selectedNodeRgtValue").value=null;
	document.getElementById("selectedNodeDepthValue").value=null;
	document.getElementById("childName").value=null;
}

function showInfo(nodeIdOrName, nodeLft, nodeRgt, nodeDepth){
	nestedSets = JSON.parse(getCookie('treeValue'));
	var selectedNode = searchNodeById(nestedSets, nodeIdOrName);
	if(selectedNode == null){
		selectedNode = searchNodeByNodeInfo(nestedSets, nodeIdOrName, nodeLft, nodeRgt, nodeDepth);
	}
	loadForm(selectedNode);
	titulos = {id : "ID", nodetext: "Texto de Nodo", lft: "Izquierda", rgt: "Derecha", depth: "Profundidad"};
	//actions = {generateDeleteNodeByIdButton: "id"};
	actions = {generateDeleteNodeByNodeInfoButton: ["nodetext", "lft", "rgt", "depth"]};
	//actions = {generateDeleteNodeByIdButton: "id", generateDeleteNodeByNodeInfoButton: ["nodetext", "lft", "rgt", "depth"]};
	var table = createDataTable("nodeChilds", "Hijos de "+selectedNode.nodetext, titulos, searchChild(nestedSets, selectedNode), actions);
	var nodeNameDiv = document.getElementById("selectedNodeName");
	removeAllChild(nodeNameDiv);
	nodeNameDiv.appendChild( document.createTextNode( "Agregar hijo a "+selectedNode.nodetext));
	document.getElementById("addChildForm").style.visibility="visible";
	document.getElementById("childNodes").appendChild(table);
}

function searchNodeById(tree, nodeId){
	if(typeof StopIteration == "undefined") {
		StopIteration = new Error("StopIteration");
	}
	var ret = null;
	
	try{
		tree.forEach(function(node){
			if(node.id == nodeId){
				ret = node;
				throw StopIteration;
			}
		});
	}catch (error){
		if(error != StopIteration)
			throw error;
	}
	return ret;
}

function searchNodeByNodeInfo(tree, nodeText, nodeLft, nodeRgt, nodeDepth){
	if(typeof StopIteration == "undefined") {
		StopIteration = new Error("StopIteration");
	}
	var ret = null;
	
	try{
		tree.forEach(function(node){
			if(node.nodetext == nodeText
				&& node.lft == nodeLft
				&& node.rgt == nodeRgt
				&& node.depth == nodeDepth){
				ret = node;
				throw StopIteration;
			}
		});
	}catch (error){
		if(error != StopIteration)
			throw error;
	}
	return ret;
}

function hasChild(tree, node){
	var ret = false;
	tree.forEach(function(nodeTree){
		if(node.lft < nodeTree.lft
			&& node.rgt > nodeTree.rgt
			&& node.depth+1 == nodeTree.depth){
			ret = true;
		}
	});
	return ret;
}

function generateDeleteNodeByIdButton(id){
	var img = document.createElement("img");
	img.setAttribute("src", "img/delete.png");
	img.setAttribute("alt", "Borrar");
	img.setAttribute("class", "action");
	if(img.attachEvent){
		img.attachEvent("onclick", "javascript:deleteNode("+ id +")" );
	}else{
		img.setAttribute("onclick", "javascript:deleteNode("+ id +")");
	}
	return img;
}

function generateDeleteNodeByNodeInfoButton(nodetext, lft, rgt, depth){
	var img = document.createElement("img");
	img.setAttribute("src", "img/delete.png");
	img.setAttribute("alt", "Borrar");
	img.setAttribute("class", "action");
	if(img.attachEvent){
		img.attachEvent("onclick", "javascript:deleteNode(\""+ nodetext +"\", "+ lft +", "+ rgt +", "+ depth +")" );
	}else{
		img.setAttribute("onclick", "javascript:deleteNode(\""+ nodetext +"\", "+ lft +", "+ rgt +", "+ depth +")");
	}
	return img;
}

function deleteNode(nodeIdOrName, nodeLft, nodeRgt, nodeDepth){
	console.log(nodeIdOrName, nodeLft, nodeRgt, nodeDepth);
	var arr = [];
	if(typeof StopIteration == "undefined") {
		StopIteration = new Error("StopIteration");
	}
	nestedSets = JSON.parse(getCookie('treeValue'));
	var searchedNode = searchNodeById(nestedSets, nodeIdOrName);
	if(searchedNode == null){
		searchedNode = searchNodeByNodeInfo(nestedSets, nodeIdOrName, nodeLft, nodeRgt, nodeDepth);
	}
	if(hasChild(nestedSets, searchedNode)){
		alert("Para borrar el NODO, este no debe de tener hijos!!!");
		return;
	}
	
	var deletedNode = null;
	try{
		var it = 0;
		nestedSets.forEach(function(node){
			if(node.id == nodeIdOrName){
				if(!confirm("Esta seguro que desea borrar "+node.nodetext+"?")){
					return;
				}
				//deleteNode = node;
				deletedNode = node;
				delete nestedSets[it];
				throw StopIteration;				
			}
			it++;
		});
		if(deletedNode == null){
			var it = 0;
			nestedSets.forEach(function(node){
				if(node.nodetext == nodeIdOrName
					&& node.lft == nodeLft
					&& node.rgt == nodeRgt
					&& node.depth == nodeDepth){
					if(!confirm("Esta seguro que desea borrar "+node.nodetext+"?")){
						return;
					}
					//deleteNode = node;
					deletedNode = node;
					delete nestedSets[it];
					throw StopIteration;				
				}
				it++;
			});
		}
	}catch (error){
		if(error != StopIteration)
			throw error;
	}

	// busco el id del padra pare redibujar la tabla de hijos
	// y LUEGO reordeno los numeros lft y rgt
	var parent = null;
	nestedSets.forEach(function(node){
		if(deletedNode.lft > node.lft
				&& deletedNode.rgt < node.rgt
				&& deletedNode.depth == node.depth+1){
				parent = node;
		}
		if(node.lft > deletedNode.lft){
			node.lft = node.lft - 2;
		}
		if(node.rgt > deletedNode.lft){
			node.rgt = node.rgt - 2;
		}
	});
	nestedSets = nestedSets.filter(function(){return true;});// remuevo los elementos nulos del array
	setCookie('treeValue', JSON.stringify(nestedSets));
	sons = buildTree(nestedSets);
	removeAllChild(document.getElementById('showTree'));
	document.getElementById('showTree').appendChild(sons);
	editTree = true;
	console.log("parent"+ parent);
	if(parent.id != undefined && parent.id != null){
		showInfo(parent.id);		
	}else{
		showInfo(parent.nodetext, parent.lft, parent.rgt, parent.depth);
	}
}

/**
 * Agrega un hijo a un nodo, agregando al final(de izquiera a  derecha)
 */
function addNode(){
	nestedSets = JSON.parse(getCookie('treeValue'));
	var node = searchNodeByNodeInfo(nestedSets, document.getElementById("selectedNodeTextValue").value, document.getElementById("selectedNodeLftValue").value, document.getElementById("selectedNodeRgtValue").value, document.getElementById("selectedNodeDepthValue").value);
	var nodeChilds = searchChild(nestedSets, node);
	var childName = document.getElementById("childName");
	if(childName.value == null || childName.value == ""){
		alert("Por favor, ingrese el Texto del nodo");
		childName.focus();
		return;
	}
	var newNode = {nodetext: childName.value, lft: null, rgt: null, depth: node.depth+1};
	nodeChilds.forEach(function(nodeChild){
		if((newNode.lft == null && newNode.rgt == null)
		|| newNode.lft <= nodeChild.lft){
			newNode.lft = nodeChild.rgt+1;
			newNode.rgt = nodeChild.rgt+2;
		}else{
		}
	});
	if(newNode.lft == null && newNode.rgt == null){
		newNode.lft = node.lft+1;
		newNode.rgt = node.lft+2;
	}
	nestedSets.forEach(function(node){
		if(node.lft >= newNode.lft){
			node.lft +=2; 
		}
		if(node.rgt >= newNode.lft){
			node.rgt +=2; 
		}
	});
	nestedSets[nestedSets.length] = newNode;
	
	setCookie('treeValue', JSON.stringify(nestedSets));
	cleanForm();	
	sons = buildTree(nestedSets);
	removeAllChild(document.getElementById('showTree'));
	document.getElementById('showTree').appendChild(sons);
	editTree = true;
	showInfo(node.nodetext, node.lft, node.rgt, node.depth);
}

function saveTree(){
	if(!editTree){
		alert("No se realizo cambio algun al Arbol!!!");
		return;
	}
	save = confirm("Desea Guardar el Arbol?");
	if(save){
		ajaxObj = new createXMLObject();
		ajaxObj.open("POST", nestedSetsUrl, true);
		ajaxObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		//ajaxObj.send("t=s&tv="+getCookie("treeValue"));
		ajaxObj.send("t=s");// envio el arbol por cookie nomas
		ajaxObj.onreadystatechange = function(){
			if(ajaxObj.readyState == 4 && ajaxObj.status == 200){
				if(ajaxObj.responseText == "ok"){
					alert("Guardado con Exito");
					init();
				}else{
					alert("Problema al guardar: "+ajaxObj.responseText);
				}
			}
		};		
	}
}