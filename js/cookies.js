function getCookie (name) 
{
	var cookies = document.cookie.split(";");
	for(var i = 0; i < cookies.length; i++)
	{
		if(cookies[i].split("=")[0] == name) 
		{
			return decodeURIComponent(cookies[i].split("=")[1]);
		}
	}		
	return undefined;
}

function setCookie (name, value, date) 
{
	document.cookie = name + "=" + encodeURIComponent(value) + ";" + (date ? "expires=" + date : "");
}

function deleteCookie (name) 
{
	document.cookie = name + "=;expires=1-1-1900";
}

function getAllCookies () {
	var cookies = document.cookie.split(";");
	var parsed = [];
	for(var i = 0; i < cookies.length; i++)
	{
		parsed[ cookies[i].split("=")[0].trim() ] = decodeURIComponent( cookies[i].split("=")[1] );
	}
	return parsed;
}