/**
 * 
 */

rootUrl = "http://localhost/php/is4/nestedSets/server/";
var currentView;//cual es la vista actual, una vista por cada item en el menu 

function createXMLObject(){
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp;
}

function clearView(viewName){
	var view = document.getElementById(viewName);
	if(view != undefined){
		view.setAttribute("class", "hideContent");		
	}
}

function showView(viewName){
	clearView(currentView);
	var view = document.getElementById(viewName);
	view.setAttribute("class", "viewContent");
	currentView = viewName;
}

//titulosColumna
function createDataTable(tableId, titulo, titulosColumna, datos, actions){
	removeElement(document.getElementById(tableId));// borro la tabla si es que ya existe
	var tabla = document.createElement("table");
	tabla.setAttribute("id",tableId);
	
	if(titulo != null){
		var caption = document.createElement("caption");
		caption.appendChild(document.createTextNode(titulo));
		tabla.appendChild(caption);
	}
	// Creo los titulos
	var rowHeader = document.createElement('tr');	
	var countColumn = 0;
	for(titulo in titulosColumna){
		var colIdNombreHeader = document.createElement('th');
		colIdNombreHeader.appendChild(document.createTextNode(titulosColumna[titulo]));
		rowHeader.appendChild(colIdNombreHeader);
		countColumn++;
	}
	if(actions != null){
		var colIdNombreHeader = document.createElement('th');
		colIdNombreHeader.appendChild(document.createTextNode("Acciones"));
		rowHeader.appendChild(colIdNombreHeader);
		countColumn++;
	}
	tabla.appendChild(rowHeader);
	
	// Creo los las filas de la tabla
	if(datos.length > 0){
		for (dato in datos){
			var row = document.createElement('tr');
			if(dato % 2 == 0){
				row.setAttribute("class", "even");
			}else{
				row.setAttribute("class", "odd");
			}
			// for para cargar los datos a la tabla
			for(titulo in titulosColumna){
				var col = document.createElement('td');
				if(!datos[dato][titulo] != "null" && datos[dato][titulo] != null){
					col.appendChild(document.createTextNode(datos[dato][titulo]));
				}
				row.appendChild(col);
			}
			//agrego las acciones por cada fila
			if(actions != null){
				var colActions = document.createElement('td');
				for(action in actions){
					var params = "";
					if( Array.isArray(actions[action])){
						actions[action].forEach(function(param) {
							if(isNaN(datos[dato][param])){
								params += "\""+datos[dato][param]+"\" ,";
							}else{
								params += datos[dato][param]+",";
							}
						});
						params = params.substr(0, params.length-1);
					}else{
						params = datos[dato][actions[action]];
					}
					colActions.appendChild( eval( action+"("+params.replace("'","\'")+")"));
				}
				row.appendChild(colActions);
			}
			tabla.appendChild(row);
		}		
	}else{
		var row = document.createElement('tr');
		row.setAttribute("class", "noData");
		var col = document.createElement('td');
		col.setAttribute('colspan', countColumn);
		col.appendChild(document.createTextNode("No hay datos"));
		row.appendChild(col);
		tabla.appendChild(row);
	}
	return tabla;
	
}

/*
 * caaaasi esta funcion, me falta ver como la paso a donde 
 * deberia de llamar en el onclic
 */


function columnsInTable(tableObject){
	var max = 0;
	for (var i = 0 ; i < tableObject.rows.length; i++){
		row = tableObject.rows[i];
		if(row.childNodes.length > max){
			max = row.childNodes.length;
		}
	}
	return max;
}

//function generarSemestrePaginador(tableName, url, paginatorAccion){
function generarPaginador(tableName, url, paginatorAccion, searchParam){
	xmlHttp = createXMLObject();
	xmlHttp.open("GET", url+"?ac=total&"+searchParam, true);//cantidad
	xmlHttp.send();
	xmlHttp.onreadystatechange=function(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			response = xmlHttp.responseText;
			cantidadPaginas = response/10;
			table = document.getElementById(tableName);
			paginatorCol = document.createElement("td");
			paginatorCol.setAttribute("colspan", columnsInTable(table));
			paginator = document.createElement("div");
			paginator.setAttribute("class", "paginator");
			if(cantidadPaginas >= 1){
				for(var i = 1; i <= cantidadPaginas+1; i++){
					numPage = document.createElement("span");
					numPage.appendChild(document.createTextNode(i));
					numPage.setAttribute("class", "paginatorNode");
					if(numPage.attachEvent){
						numPage.attachEvent("onclick", paginatorAccion+"("+(i-1)*10+", '"+(searchParam != null ? searchParam : null)+"')"  );
					}else{
						numPage.setAttribute("onclick", paginatorAccion+"("+(i-1)*10+", '"+(searchParam != null ? searchParam : null)+"')"  );
					}
					paginator.appendChild(numPage);
				}
				
			}
			span = document.createElement("span");
			span.appendChild(document.createTextNode("Cantidad de Registros: "+response));
			paginator.appendChild(span);
			paginatorCol.appendChild(paginator);
			paginatorRow = document.createElement("tr");
			paginatorRow.setAttribute("class", "foot");
			paginatorRow.appendChild(paginatorCol);
			table.appendChild(paginatorRow);
		}
	};
}

function removeAllChild(o){
	if(o.hasChildNodes()){
		while( o.hasChildNodes() ){
			o.removeChild(o.lastChild);
		}		
	}
}

function removeElement(o){
	if(o != null){
		o.parentNode.removeChild(o);		
	}
}

function formToUrl(formId){
	var form = document.getElementById(formId);
	var urlStr = "";
	for(var i = 0; i < form.elements.length; i++){
		el = form.elements[i];
		elName = el.tagName.toLowerCase();
		elType = el.type.toLowerCase();
		switch(elName.toLowerCase()){
			case "input":
				switch(elType.toLowerCase()){
					case "hidden": case "text": case "password":
						if(el.value != null && el.value != "" && el.value != "null"){
							urlStr += encodeURIComponent(el.id)+ "="+ encodeURIComponent(el.value)+"&";
						}
						break;
					case "checkbox": case "radio":
						break;	
				}
				break;
			case "select":
				if(el.value != null && el.value != "" && el.value != "null"){
					urlStr += encodeURIComponent(el.id)+ "="+ encodeURIComponent(el.value)+"&";					
				}
				break;
			case "textarea":
				urlStr += encodeURIComponent(el.id)+ "="+ encodeURIComponent(el.value)+"&";
				break;
		}
	}
	urlStr = urlStr.substring(0, urlStr.length-1);
	return urlStr;
}

function optionValues(selectElement, nombre, url){
	console.log(selectElement.id+" "+url);
	removeAllChild(selectElement);
	xmlHttp = createXMLObject();
	xmlHttp.open("GET", url+"?lista", true);
	xmlHttp.send();
	xmlHttp.onreadystatechange=function(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var option = document.createElement("option");
			option.appendChild(document.createTextNode("Seleccione una opcion"));
			selectElement.appendChild(option);
			arrResult = JSON.parse(xmlHttp.responseText);
			for(var i = 0; i < arrResult.length; i++){
				var option = document.createElement("option");
				option.setAttribute('value', arrResult[i].id);
				if(arrResult[i].nombre == nombre){
					option.setAttribute('selected', 'selected');
				}
				option.appendChild(document.createTextNode(arrResult[i].nombre));
				selectElement.appendChild(option);
			}
			return true;
		}
	};
}

function setCookie(cookieName, cookieValue, cookiePath, cookieExpires){
	cookieValue = escape(cookieValue);
	if(cookieExpires == ""){
		var nowDate = new Date();
		nowDate.setMonth(nowDate.getMonth()+6);
		cookieExpires = nowDate.toUTCString();
	}
	if(cookiePath != ""){
		cookiePath = ';Path='+cookiePath;
	}
	document.cookie = cookieName+ '='+ cookieValue+';expires='+ cookieExpires + cookiePath;
}

function getCookie(cookieName){
	var cookieValue = document.cookie;
	var cookieStartsAt = cookieValue.indexOf(" " + cookieName + "=");
	if(cookieStartsAt == -1) {
		cookieStartsAt = cookieValue.indexOf(cookieName + "=");
	}
	if(cookieStartsAt == -1) {
		cookieValue = null;
	}else{
		cookieStartsAt = cookieValue.indexOf("=", cookieStartsAt)+1;
		var cookieEndsAt = cookieValue.indexOf(";", cookieStartsAt);
		if(cookieEndsAt == -1){
			cookieEndsAt = cookieValue.length;
		}
		cookieValue = unescape(cookieValue.substring(cookieStartsAt, cookieEndsAt));
	}
	return cookieValue;
}