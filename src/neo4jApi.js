require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Accident = require('./models/Accident');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo5j"));

function getAccident(number) {
  var session = driver.session();
  return session
    .run(
      "MATCH (acc:Accident {number:{number}}) \
      RETURN acc\
      LIMIT 1", {number})
    .then(result => {
      session.close();

      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0].get('acc');
      return new Accident(record);
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function searchAccidents(queryString) {
    var session = driver.session();
    return session
        .run(
            'MATCH (acc:Accident)\
             WHERE acc.number STARTS WITH {queryString}\
             RETURN acc\
             LIMIT 10', {queryString})
        .then(result => {
            session.close();
            return result.records.map(r => {
                var record = r.get('acc');
                return new Accident(record);
            });
        })
        .catch(error => {
            session.close();
            throw error;
        });
}

function searchAccidentsOnDayAndLocation(year, month, day, lat, lng, rad) {
    var session = driver.session();
    console.log(rad);
    return session
        .run(
            'WITH date({ year: toInt({year}), month: toInt({month}) + 1, day: toInt({day}) }) as d\
             WITH localdatetime({date: d, time: time("00:00") }) as start \
             WITH start, start + duration("P1D") as end\
             MATCH (acc:Accident)\
             WHERE start < acc.dt < end AND distance(acc.p, point({latitude: {lat}, longitude: {lng} })) < toInt({rad}) \
             RETURN acc', {year: year, month: month, day: day, lat:lat, lng: lng, rad: rad})
        .then(result => {
            session.close();
            return result.records.map(r => {
                var record = r.get('acc');
                return new Accident(record);
            });
        })
        .catch(error => {
            session.close();
            throw error;
        });
}

function streamAccidents() {
    var session = driver.session();
    return session
        .run(
            'MATCH (acc:Accident)\
             RETURN acc\
             ORDER BY acc.dt\
             LIMIT 100')
        .then(result => {
            session.close();
            return result.records.map(r => {
                var record = r.get('acc');
                return new Accident(record);
            });
        })
        .catch(error => {
            session.close();
            throw error;
        });
}

exports.getAccident = getAccident;
exports.searchAccidents = searchAccidents;
exports.searchAccidentsOnDayAndLocation = searchAccidentsOnDayAndLocation;
exports.streamAccidents = streamAccidents;

