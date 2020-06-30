const csv2json = require('csvjson-csv2json');
const request = require('request');
const fs = require('fs');

const vaastav_fpl = 'https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/';
const season = '2019-20';

/*
GW player data 
Use id as key
*/
function gameweek_data(gw, season) {

    const endpoint = vaastav_fpl + season + `/gws/gw${gw}.csv`;
    const save_location = 'data/' + season + `/gws/gw${gw}.json`;
    const player_data = JSON.parse(fs.readFileSync('data/' + season + '/players.json'));
    
    request.get(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = csv2json(body, {parseNumbers: true, hash: false});
            const json = {};
            data.forEach(function(val, index, arr) {
                let key = val.name.split('_')[2];
                json[key] = {
                    'id': parseInt(key),
                    'first_name': player_data[key].first_name,
                    'second_name': player_data[key].second_name,
                    'web_name': player_data[key].web_name,
                    'position': player_data[key].position,
                    'team': player_data[key].team,
                    ...val
                    };
            });
            fs.writeFile(save_location, JSON.stringify(json), function (err) {
                if (err) throw err;
                console.log(`GW${gw} player data saved at ${save_location}` );
              });            
        } else {
            console.log('Error!');
            return false;
        }
    });
}

/*
Player list 
Use id as key
*/
function player_list(season) {

    const endpoint1 = vaastav_fpl + season + '/player_idlist.csv';
    const endpoint2 = vaastav_fpl + season + '/players_raw.csv';
    const save_location = 'data/' + season + '/players.json';
    const gw1_data = JSON.parse(fs.readFileSync('data/' + season + '/gws/gw1.json'));
    
    request.get(endpoint1, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const json1 = csv2json(body, {parseNumbers: true, hash: false});
            request.get(endpoint2, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const json2 = csv2json(body, {parseNumbers: true, hash: false});
                    const data = Object. assign(json1, json2);
                    // Reformat 
                    const json = {};
                    data.forEach(function(val, index, arr) {
                        let key = val.id;
                        json[key] = {
                            'id': val.id,
                            'first_name': val.first_name,
                            'second_name': val.second_name,
                            'web_name': val.web_name,
                            'position': val.element_type,
                            'team': val.team,
                            'news': val.news,
                            'news_added': val.news_added,
                            'key': `${val.first_name}_${val.second_name}_${val.id}`,
                            'starting_price': gw1_data[key] && gw1_data[key].value || 0,
                        };
                    });
                    fs.writeFile(save_location, JSON.stringify(json), function (err) {
                        if (err) throw err;
                        console.log(`Player list saved at ${save_location}` );
                      });            
                } else {
                    console.log('Error!');
                    return false;
                }
            });
        } else {
            console.log('Error!');
            return false;
        }
    });
}

/*
Team list 
Use id as key (1 to 20)
*/
function team_list(season) {

    const endpoint = vaastav_fpl + season + '/teams.csv';
    const save_location = 'data/' + season + '/teams.json';
    
    request.get(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = csv2json(body, {parseNumbers: true, hash: false});
            // Reformat with id as key
            const json = {};
            data.forEach(function(val, index, arr) {
                let key = val.id;
                json[key] = val;
            });
            fs.writeFile(save_location, JSON.stringify(json), function (err) {
                if (err) throw err;
                console.log(`Team list saved at ${save_location}` );
              });            
        } else {
            console.log('Error!');
            return false;
        }
    });
}

/*
Fixtures list 
Use id as key
*/
function fixtures_list(gw, season) {

    const endpoint = vaastav_fpl + season + '/fixtures.csv';
    const save_location = 'data/' + season + `/fixtures/gw${gw}.json`;
    
    request.get(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = csv2json(body, {parseNumbers: true, hash: false});
            // Only return data for specified gameweek
            const json = {};
            data.filter((val) => val.event === gw).forEach(function(val, index, arr) {
                let key = val.id;
                json[key] = val;
                json[key]['stats'] = JSON.parse(val.stats.replace(/'/g,'"'));
            });
            fs.writeFile(save_location, JSON.stringify(json), function (err) {
                if (err) throw err;
                console.log(`GW${gw} fixtures saved at ${save_location}` );
              });            
        } else {
            console.log('Error!');
            return false;
        }
    });
}


// Execute
// For GW1 to GW40
for (i = 1; i <= 40; i++) {
    gameweek_data(i, season);
    fixtures_list(i, season);
}
player_list(season);
team_list(season);
