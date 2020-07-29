const csv2json = require('csvjson-csv2json');
const request = require('request');
const fs = require('fs');

const vaastav_fpl = 'https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/';
const season = '2019-20';

/*
GW player data 
Indexed by id
*/
function gameweek_data(gw, season) {

    const endpoint = vaastav_fpl + season + `/gws/gw${gw}.csv`;
    const save_location = 'data/' + season + `/gws/gw${gw}.json`;
    const player_data = JSON.parse(fs.readFileSync('data/' + season + '/players.json'));
    
    request.get(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = csv2json(body, {parseNumbers: true, hash: false});
            const json = [];
            data.forEach(function(val, i, arr) {
                const player = player_data && player_data.filter(f => f && f.id === val.element)[0];
                const index = val.element;
                json[index] = {
                    'id': val.element,
                    'first_name': player && player.first_name,
                    'second_name': player && player.second_name,
                    'web_name': player && player.web_name,
                    'position': player && player.position,
                    'team': player && player.team,
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
Indexed by id
*/
function player_list(season) {

    const endpoint1 = vaastav_fpl + season + '/player_idlist.csv';
    const endpoint2 = vaastav_fpl + season + '/players_raw.csv';
    const save_location = 'data/' + season + '/players.json';
    
    request.get(endpoint1, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data1 = csv2json(body, {parseNumbers: true, hash: false});
            request.get(endpoint2, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const data2 = csv2json(body, {parseNumbers: true, hash: false});
                    const data = Object.assign(data1, data2);
                    const json = [];
                    data.forEach(function(val, i, arr) {
                        const index = val.id;
                        json[index] = {
                            'id': val.id,
                            'first_name': val.first_name,
                            'second_name': val.second_name,
                            'web_name': val.web_name,
                            'position': val.element_type,
                            'team': val.team,
                            'news': val.news,
                            'news_added': val.news_added,
                            'key': `${val.first_name}_${val.second_name}_${val.id}`,
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
Indexed by id (1 to 20)
*/
function team_list(season) {

    const endpoint = vaastav_fpl + season + '/teams.csv';
    const save_location = 'data/' + season + '/teams.json';
    
    request.get(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = csv2json(body, {parseNumbers: true, hash: false});
            const json = [];
            data.forEach(function(val, i, arr) {
                const index = val.id;
                json[index] = val;
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
Indexed by id
*/
function fixtures_list(season) {

    const endpoint = vaastav_fpl + season + '/fixtures.csv';
    const save_location = 'data/' + season + `/fixtures.json`;
    
    request.get(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = csv2json(body, {parseNumbers: true, hash: false});
            const json = [];
            data.forEach(function(val, i, arr) {
                const index = val.id;
                json[index] = val;
                json[index]['stats'] = JSON.parse(val.stats.replace(/'/g,'"'));
            });
            fs.writeFile(save_location, JSON.stringify(json), function (err) {
                if (err) throw err;
                console.log(`Master fixtures saved at ${save_location}` );
              });      

            // Write separate gameweek files
            for (gw = 1; gw <= 47; gw++) {
                const gw_save_location = 'data/' + season + `/fixtures/gw${gw}.json`;
                const gw_data = json.filter(f => f && f.event === gw);
                fs.writeFile(gw_save_location, JSON.stringify(gw_data), function (err) {
                    if (err) throw err;
                    console.log(`Fixtures data saved at ${gw_save_location}` );
                });  
            }      
        } else {
            console.log('Error!');
            return false;
        }
    });
}


// Execute
// For GW1 to GW47
for (i = 1; i <= 47; i++) {
    gameweek_data(i, season);
}
player_list(season);
team_list(season);
fixtures_list(season);
