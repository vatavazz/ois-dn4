var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';
var ehrId = '';
var sessionId = '';

var username = "ois.seminar";
var password = "ois4fri";
var pname = "";

var alanaP = [180,100,190,100,180,110,200,120,180,100,170,90,170,95,175,95,185,100,180,105];
var kristinaP = [180,100,190,100,180,90,170,90,175,90,160,90,165,100,155,85,160,80,150,90,140,90];
var zalaP = [100,70,110,80,105,70,100,70,80,60,100,70,75,55,90,60,100,80,105,70];
var alanaEhr=0;
var kristinaEhr=0;
var zalaEhr=0;

var map;
var infowindow;
//var directionsDisplay;
//var directionsService = new google.maps.DirectionsService();

function getSessionId() {
	var response = $.ajax({
		type: "POST",
		url: baseUrl + "/session?username=" + encodeURIComponent(username) +
				"&password=" + encodeURIComponent(password),
		async: false
	});
	return response.responseJSON.sessionId;
}

function ustvariPacienta(){
	if ($("#pacientIme").val().trim().length == 0 || $("#pacientPriimek").val().trim().length == 0 || $("#pacientRojstni").val().trim().length == 0 ) {
		$("#tablePodatki").html("Prosim izpolnite zahtevana polja!");
		return;
	} else {
		sessionId = getSessionId();
		$.ajaxSetup({
			headers: {
			"Ehr-Session": sessionId
			}
		});
		$.ajax({
			url: baseUrl + "/ehr",
			type: 'POST',
			success: function (data) {
				var ehrId = data.ehrId;
				$("#tablePodatki").html("EHR: " + ehrId);
				// build party data
				var partyData = {
					firstNames: $("#pacientIme").val(),
					lastNames: $("#pacientPriimek").val(),
					dateOfBirth: $("#pacientRojstni").val(),
					partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
				};
				if ($("#pacientIme").val() == "Kristina"){
					kristinaEhr = ehrId;
				}
				if ($("#pacientIme").val() == "Alana"){
					alanaEhr = ehrId;
				}
				if ($("#pacientIme").val() == "Zala"){
					zalaEhr = ehrId;
				}

				$.ajax({
					url: baseUrl + "/demographics/party",
					type: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(partyData),
					success: function (party) {
						if (party.action == 'CREATE') {
							// $("#result").html("Created: " + party.meta.href);
						}
					},
					error: function(err) {
						//alert(err);
					}
				});
			},
			error: function(err) {
				//alert("err: "+err);
			}
		});
	}
}

function najdiPacienta() {
	var nIme = $("#najdiPacIme").val();
	var nPriim = $("#najdiPacPriimek").val();
	sessionId = getSessionId();
	$.ajaxSetup({
		 headers: {
			"Ehr-Session": sessionId
		 }
	});

	var searchData = [
		{key: "firstNames", value: nIme},
		{key: "lastNames", value: nPriim}
	];

	$.ajax({
		url: baseUrl + "/demographics/party/query",
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(searchData),
		success: function (res) {
			$("#tablePodHeader").html("");
			$("#tablePodatki").html("");
			if (jQuery.isEmptyObject(res)) {
				$("#tablePodHeader").html("");
				$("#tablePodatki").html('Pacienta po imenu '+nIme +' '+nPriim+' ni mogoče najti.');
			}
			for (var i in res.parties) {
					var party = res.parties[i];
					var ehrId;
					for (var j in party.partyAdditionalInfo) {
						if (party.partyAdditionalInfo[j].key === 'ehrId') {
							ehrId = party.partyAdditionalInfo[j].value;
							break;
						}
					}
					$("#tablePodHeader").html("<tr><th>Ime, Priimek</th><th>Rojstni datum</th><th>EHR</th><th>ID</th></tr>");
					var date = new Date(party.dateOfBirth);
					$("#tablePodatki").append('<tr><td>'+party.firstNames+' '+party.lastNames+'</td><td>'+date.getDate()+'. '+(date.getMonth()+1)+'. '+date.getFullYear()+'</td><td>'+ehrId+'</td><td>'+party.id+'</td></tr>');
					//zbrisiPacienta(party.id);
			}
		}
	});
}

function zbrisiPacienta(zbrisiId) {
	sessionId = getSessionId();
	$.ajaxSetup({
		headers: {
			"Ehr-Session": sessionId
		}
	});

	$.ajax({
		url: baseUrl + "/demographics/party/"+zbrisiId,
		type: 'DELETE',
		contentType: 'application/json',
		success: function (party) {
		}
	});
}

function pobrisiPacienta() {
	var nIme = $("#najdiPacIme").val();
	var nPriim = $("#najdiPacPriimek").val();
	sessionId = getSessionId();
	$.ajaxSetup({
		 headers: {
			"Ehr-Session": sessionId
		 }
	});

	var searchData = [
		{key: "firstNames", value: nIme},
		{key: "lastNames", value: nPriim}
	];

	$.ajax({
		url: baseUrl + "/demographics/party/query",
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(searchData),
		success: function (res) {
			for (var i in res.parties) {
				var party = res.parties[i];
				zbrisiPacienta(party.id);
			}
			$("#tablePodHeader").html("");
			$("#tablePodatki").html('Pacient po imenu '+nIme +' '+nPriim+' je bil izbrisan.');
		}
	});
}

function ustvariTeste(){
	var choice = $("#ustvariPodatkeDD").val();
	var ehrst;
	var merTlaka=[];
	//najde po imenu in pobriše osebo
	//najdiTestPacienta(time, tpriimek);

	if (choice == "Kristina") {
		ehrst = kristinaEhr;
		merTlaka = kristinaP;
	}
	else if (choice == "Alana") {
		ehrst = alanaEhr;
		merTlaka = alanaP;
	}
	else if (choice == "Zala") {
		ehrst = zalaEhr;
		merTlaka = zalaP;
	}

	//alert("Wha");
	ustvariMeritev(ehrst, 2014-4-1, merTlaka[0], merTlaka[1]);
	ustvariMeritev(ehrst, 2014-4-8, merTlaka[2], merTlaka[3]);
	ustvariMeritev(ehrst, 2014-4-15, merTlaka[4], merTlaka[5]);
	ustvariMeritev(ehrst, 2014-4-22, merTlaka[6], merTlaka[7]);
	ustvariMeritev(ehrst, 2014-4-29, merTlaka[8], merTlaka[9]);
	ustvariMeritev(ehrst, 2014-5-6, merTlaka[10], merTlaka[11]);
	ustvariMeritev(ehrst, 2014-5-13, merTlaka[12], merTlaka[13]);
	ustvariMeritev(ehrst, 2014-5-20, merTlaka[14], merTlaka[15]);
	ustvariMeritev(ehrst, 2014-5-27, merTlaka[16], merTlaka[17]);
	ustvariMeritev(ehrst, 2014-6-3, merTlaka[18], merTlaka[19]);
}

function ustvariRocnoMeritev(){
	var ehrst = $("#dodajMeritevEHR").val();
	var cas = $("#dodajMeritevCas").val();
	var sistlak = $("#dodajMeritevSis").val();
	var diatlak = $("#dodajMeritevDia").val();
	ustvariMeritev(ehrst, cas, sistlak, diatlak);
}

function ustvariMeritev(ehrst, cas, sistlak, diatlak){
	sessionId = getSessionId();
	$.ajaxSetup({
		headers: {
		"Ehr-Session": sessionId
		}
	});
	var compositionData = {
		"ctx/time": cas,
		"ctx/language": "en",
		"ctx/territory": "CA",
		"vital_signs/blood_pressure/any_event/systolic": sistlak,
		"vital_signs/blood_pressure/any_event/diastolic": diatlak,
	};
	var queryParams = {
		"ehrId": ehrst,
		templateId: 'Vital Signs',
		format: 'FLAT',
		committer: 'Belinda Nurse'
	};
	$.ajax({
		url: baseUrl + "/composition?" + $.param(queryParams),
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(compositionData),
		success: function (res) {
			//alert("done");
			$("#ustvariMeritevResponse").html("<br />Meritev je bila uspešno shranjena.");
			//$("#result").html(res.meta.href);
		}, error: function (err) {
			alert(JSON.stringify(err));
			$("#ustvariMeritevResponse").html("<br />Pri vpisovanju meritve je prišlo do napake. Prosim, preverite če so vsa polja pravilno izpolnjena.");
		}
	});
}

function prikaziPodatkePacienta(){
	sessionId = getSessionId();
	ehrId = $("#prikaziPodatkeEHR").val();
	$("#tablePodatki").html("");
	$("#tablePodHeader").html("");
	$.ajax({
		url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (data) {
			var party = data.party;
			$("#tablePodatki").append('<tr><td><b>Ime, priimek:</b></td><td>'+party.firstNames+' '+party.lastNames+'</td></tr>');
			var date = new Date(party.dateOfBirth);
			$("#tablePodatki").append('<tr><td><b>Rojstni datum:</b></td><td>'+date.getDate()+'. '+(date.getMonth()+1)+'. '+date.getFullYear()+'</td></tr>');
			
			$.ajax({
				url: baseUrl + "/view/" + ehrId + "/blood_pressure",
				type: 'GET',
				headers: {
					"Ehr-Session": sessionId
				},
				success: function (res) {
					if (res.length > 0) {
						var date = new Date(res[0].time);
						$("#tablePodatki").append('<tr><td><b>Zadnje merjenje:</b></td><td>'+date.getDate()+'. '+(date.getMonth()+1)+'. '+date.getFullYear()+'</td></tr>');
						$("#tablePodatki").append('<tr><td><b>Zadnji izmerjen pritisk:</b></td><td>'+res[0].systolic+'/'+res[0].diastolic+'</td></tr>');
					} else {
						$("#tablePodatki").append('<tr><td><b>Zadnje merjenje:</b></td><td>/</td></tr>');
						$("#tablePodatki").append('<tr><td><b>Zadnji izmerjen pritisk:</b></td><td>/</td></tr>');
					}
				}
			});
		}, error: function(err) {
			$("#tablePodatki").html("Iskani pacient "+ehrId+" ne obstaja.");
		}
	});
}

function najdiMeritve(){
	sessionId = getSessionId();
	ehrId = $("#prikaziMeritveEHR").val();
	$.ajax({
		url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (data) {
			var party = data.party;
			pname = party.firstNames + " " + party.lastNames;
			$.ajax({
				url: baseUrl + "/view/" + ehrId + "/blood_pressure",
				type: 'GET',
				headers: {
					"Ehr-Session": sessionId
				},
				success: function (res) {
					$("#mhead").html("");
					$("#mbody").html("");
					if (res.length > 0) {
						$("#mhead").html("<tr><th>Priimek, ime</th><th>Čas meritve</th><th>Sistolični pritisk</th><th>Diastolični pritisk</th></tr>");
						for (var i in res) {
							var date = new Date(res[i].time);
							$("#mbody").append("<tr><td>"+pname+"</td><td>"+date.getDate()+'. '+(date.getMonth()+1)+'. '+date.getFullYear()+"</td><td>"+res[i].systolic+"</td><td>"+res[i].diastolic+"</td></tr>");
						}
					} else {
						$("#mbody").html("<br />"+pname+" ("+ehrId+") še nima vpisanih meritev.");
					}
				}
			});
		}, error: function(err) {
			$("#mhead").html("");
			$("#mbody").html("");
			$("#mbody").append("<br />Pacient "+ehrId+" ne obstaja.");
		}
	});
}

function najdiKriticneMeritve() {
	sessionId = getSessionId();
	ehrId = $("#prikaziGrafEHR").val();
	$.ajax({
		url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (data) {
			var party = data.party;
			pname = party.firstNames + " " + party.lastNames;
			var AQL = 
				"select "+
					"a_a/data[at0001]/events[at0006]/time/value as cas, " +
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value as Diastolic, "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value as Systolic "+
					//"a_a/data[at0001]/events[at0006]/time/value as time "+
				"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
				"contains COMPOSITION a "+
				"contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.blood_pressure.v1] "+
				"where "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude>125.0 and "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/units='mm[Hg]' or "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude>85.0 and "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/units='mm[Hg]' or "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude<85.0 and "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/units='mm[Hg]' or "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude<55.0 and "+
					"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/units='mm[Hg]' "+
				//"order by a_a/data[at0001]/events[at0006]/time "+
				"offset 0 limit 100";
			$.ajax({
				url: baseUrl + "/query?" + $.param({"aql": AQL}),
				type: 'GET',
				headers: {"Ehr-Session": sessionId},
				success: function (res) {
					$("#mhead").html("");
					$("#mbody").html("");
					if (res) {
						$("#mhead").html("<tr><th>Priimek, ime</th><th>Čas meritve</th><th>Sistolični pritisk</th><th>Diastolični pritisk</th></tr>");
						//alert(JSON.stringify(res.resultSet[1]));
						var rset = res.resultSet;
						for (var i in rset) {
							var date = new Date(rset[i].cas);
							$("#mbody").append("<tr><td>"+pname+"</td><td>"+date.getDate()+'. '+(date.getMonth()+1)+'. '+date.getFullYear()+"</td><td>"+rset[i].Systolic.magnitude+"</td><td>"+rset[i].Diastolic.magnitude+"</td></tr>");
						}
					} else {
						$("#mbody").html("<br />"+pname+" ("+ehrId+") nima kritičnih meritev krvnega tlaka.");
					}
				}, error: function(err) {
					alert("errrr");
				}
			});
		}
	});
}

$(document).ready(function() {
	$('#ustvariPac').change(function() {
		var podatki = $(this).val().split(",");
		$("#pacientIme").val(podatki[0]);
		$("#pacientPriimek").val(podatki[1]);
		$("#pacientRojstni").val(podatki[2]);
	});

	$('#prikaziMeritveDD').change(function() {
		var choice = $(this).val();
		var ehrst;
		if (choice == "Kristina") {
			ehrst = kristinaEhr;
		}
		else if (choice == "Alana") {
			ehrst = alanaEhr;
		}
		else if (choice == "Zala") {
			ehrst = zalaEhr;
		}
		$("#prikaziMeritveEHR").val(ehrst);
	});

	$('#dodajMeritevDD').change(function() {
		var choice = $(this).val();
		var ehrst;
		if (choice == "Kristina") {
			ehrst = kristinaEhr;
		}
		else if (choice == "Alana") {
			ehrst = alanaEhr;
		}
		else if (choice == "Zala") {
			ehrst = zalaEhr;
		}
		$("#dodajMeritevEHR").val(ehrst);
	});

	$('#prikaziPodatkeDD').change(function() {
		var choice = $(this).val();
		var ehrst;
		if (choice == "Kristina") {
			ehrst = kristinaEhr;
		}
		else if (choice == "Alana") {
			ehrst = alanaEhr;
		}
		else if (choice == "Zala") {
			ehrst = zalaEhr;
		}
		$("#prikaziPodatkeEHR").val(ehrst);
	});

	$('#prikaziGrafDD').change(function() {
		var choice = $(this).val();
		var ehrst;
		if (choice == "Kristina") {
			ehrst = kristinaEhr;
		}
		else if (choice == "Alana") {
			ehrst = alanaEhr;
		}
		else if (choice == "Zala") {
			ehrst = zalaEhr;
		}
		$("#prikaziGrafEHR").val(ehrst);
	});
	
	$('#ustvariPodatkeDD').change(function() {
		//testniEHR = $(this).val().split(",");
		//ustvariTestneMeritve(testniEHR[0], testniEHR[1], testniEHR[2], testniEHR[3]);
	});

	zdravniki();
});

function zdravniki() {
	var url = 'http://zdravniki.org/zdravniki?specializations=17';
	var quer='http://query.yahooapis.com/v1/public/yql?q=select * from html where url=\''+url+'\' and xpath=\'//div[@id="list"]//ul//a\'&format=json&callback=?';

	$.getJSON( quer, function(data){
		$.each(data.query.results.a, function(){		 
			$('#zdravniki').append('<a href="http://zdravniki.org'+this.href +'">'+this.content+'</a><br/>');
		});
		$('#zdravniki').append('<br />Za več rezultatov obiščite <a href="http://zdravniki.org">zdravniki.org</a>.');
	});
}

function initialize() {
	//directionsDisplay = new google.maps.DirectionsRenderer();
	map = new google.maps.Map(document.getElementById('map_canvas'), {
		zoom: 10
	});

	// Try HTML5 geolocation
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

			map.setCenter(pos);

			var request = {
				location: pos,
				radius: 500,
				types: ['hospital']
			};

			infowindow = new google.maps.InfoWindow();
			var service = new google.maps.places.PlacesService(map);
			service.nearbySearch(request, callback);
			

			/*
			directions

			directionsDisplay.setMap(map);

			var request = {
				origin:start,
				destination:end,
				travelMode: google.maps.TravelMode.DRIVING
			};
			var start = position.coords.latitude+", "+position.coords.longitude;
			var end = (position.coords.latitude+1)+", "+(position.coords.longitude+1);
			directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
				}
			});
			*/

		}, function() {
			handleNoGeolocation(true);
		});
	} else {
		// Browser doesn't support Geolocation
		handleNoGeolocation(false);
	}
}

function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		 var content = 'Error: The Geolocation service failed.';
	} else {
		 var content = 'Error: Your browser doesn\'t support geolocation.';
	}

	var options = {
		 map: map,
		 position: new google.maps.LatLng(60, 105),
		 content: content
	};

	infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		 for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		 }
	}
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		 map: map,
		 position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		 infowindow.setContent(place.name);
		 infowindow.open(map, this);
	});
}

function najdiZaGraf() {
	$("#lazanja").html("");
	sessionId = getSessionId();
	ehrId = $("#prikaziGrafEHR").val();
	$.ajax({
		url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (datab) {
			var party = datab.party;
			$.ajax({
				url: baseUrl + "/view/" + ehrId + "/blood_pressure",
				type: 'GET',
				headers: {
					"Ehr-Session": sessionId
				},
				success: function (res) {
					var data = 	[{"tipTlaka":"Systolic","Data": []},
								{"tipTlaka":"Diastolic", "Data": []}];
					if (res.length > 0) {
						for (var i in res) {
							var date = new Date(res[i].time);
							var t = date.getDate()+'. '+(date.getMonth()+1)+'. '+date.getFullYear();
							data[0].Data.push({"Date":t, "Value":res[i].systolic});
							data[1].Data.push({"Date":t, "Value":res[i].diastolic});
						}
						grafF(data);
					} else {
						$("#lazanja").html("<br />"+pname+" ("+ehrId+") še nima vpisanih meritev.");
					}
				}, error: function(err){
					alert(JSON.stringify(err));
				}
			});
		}, error: function(err) {
			$("#lazanja").html("");
			$("#lazanja").append("<br />Pacient "+ehrId+" ne obstaja.");
		}
	});
}

function grafF(data) {
	$("#lazanja").html("");
		var margin = {
		top: 20,
		right: 80,
		bottom: 30,
		left: 50
		},

	width = 700 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d. %m. %Y").parse;

	var x = d3.time.scale()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var line = d3.svg.line()
		.interpolate("basis")
		.x(function (d) {return x(d.Date);})
		.y(function (d) {return y(d.Value);});

	var svg = d3.select("#lazanja").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	color.domain(data.map(function (d) { return d.tipTlaka; }));

	data.forEach(function (kv) {
		kv.Data.forEach(function (d) {
			d.Date = parseDate(d.Date);
		});
	});

	var tlak = data;

	var minX = d3.min(data, function (kv) { return d3.min(kv.Data, function (d) { return d.Date; }) });
	var maxX = d3.max(data, function (kv) { return d3.max(kv.Data, function (d) { return d.Date; }) });
	var minY = d3.min(data, function (kv) { return d3.min(kv.Data, function (d) { return d.Value; }) });
	var maxY = d3.max(data, function (kv) { return d3.max(kv.Data, function (d) { return d.Value; }) });

	x.domain([minX, maxX]);

	y.domain([0,250]);


	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Krvni tlak");

	var tipTlaka = svg.selectAll(".tipTlaka")
	    .data(tlak)
	    .enter().append("g")
	    .attr("class", "tipTlaka");

	tipTlaka.append("path")
	    .attr("class", "line")
	    .attr("d", function (d) {return line(d.Data);})
	    .style("stroke", function (d) {
	    return color(d.tipTlaka);
	});

	tipTlaka.append("text")
	    .datum(function (d) {
	    return {
	        name: d.tipTlaka,
	        date: d.Data[d.Data.length - 1].Date,
	        value: d.Data[d.Data.length - 1].Value
	    };
	})
	    .attr("transform", function (d) {
	    return "translate(" + x(d.date) + "," + y(d.value) + ")";
	})
	    .attr("x", 3)
	    .attr("dy", ".35em")
	    .text(function (d) {
	        return d.name;
	});
}