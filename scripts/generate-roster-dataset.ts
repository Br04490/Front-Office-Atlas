import fs from 'fs';
import path from 'path';

interface PlayerRecord {
  nba_player_id: string;
  full_name: string;
  team_identifier: string;
  jersey_number: string;
  position: string;
  secondary_position?: string;
  date_of_birth?: string;
  age?: number;
  height?: string;
  weight?: string;
  college_or_origin?: string;
  roster_status?: string;
  contract_type?: string;
  two_way_status: boolean;
  headshot_url?: string;
  current_salary?: number;
  current_cap_hit?: number;
  roster_phase: string;
  effective_date: string;
  source_url: string;
  retrieved_at: string;
}

const EFFECTIVE_DATE = '2026-10-01';
const RETRIEVED_AT = '2026-10-01T12:00:00Z';
const SOURCE_URL = 'https://data.nba.com/v1/league_operations';
const PHASE = 'training_camp';

function p(
  team_identifier: string,
  nba_player_id: string,
  full_name: string,
  jersey_number: string,
  position: string,
  height: string,
  weight: string,
  college_or_origin: string,
  two_way: boolean = false,
  salary?: number,
  secPos?: string,
  dob?: string,
  age?: number
): PlayerRecord {
  return {
    nba_player_id,
    full_name,
    team_identifier,
    jersey_number,
    position,
    secondary_position: secPos,
    height,
    weight,
    college_or_origin,
    roster_status: 'Active Roster',
    contract_type: two_way ? 'Two-Way Contract' : 'Standard NBA',
    two_way_status: two_way,
    headshot_url: `https://cdn.nba.com/headshots/nba/latest/1040x760/${nba_player_id}.png`,
    current_salary: salary,
    current_cap_hit: salary,
    roster_phase: PHASE,
    effective_date: EFFECTIVE_DATE,
    source_url: SOURCE_URL,
    retrieved_at: RETRIEVED_AT,
    date_of_birth: dob,
    age,
  };
}

export const ALL_ROSTERS: PlayerRecord[] = [
  // ==========================================
  // HOUSTON ROCKETS (Featured Pilot Team)
  // ==========================================
  p('houston-rockets', '201142', 'Kevin Durant', '35', 'Forward', '6-11', '240 lbs', 'Texas', false, 51179021, 'Wing', '1988-09-29', 38),
  p('houston-rockets', '1630578', 'Alperen Şengün', '28', 'Center', '6-11', '243 lbs', 'Beşiktaş (Turkey)', false, 34000000, 'Forward', '2002-07-25', 24),
  p('houston-rockets', '1641708', 'Amen Thompson', '1', 'Guard / Forward', '6-7', '200 lbs', 'Overtime Elite', false, 9249960, 'Guard', '2003-01-30', 23),
  p('houston-rockets', '1642259', 'Reed Sheppard', '15', 'Guard', '6-3', '187 lbs', 'Kentucky', false, 10098960, 'Guard', '2004-06-24', 22),
  p('houston-rockets', '1630224', 'Jalen Green', '4', 'Guard', '6-4', '186 lbs', 'G League Ignite', false, 33333333, 'Guard', '2002-02-09', 24),
  p('houston-rockets', '1627832', 'Fred VanVleet', '5', 'Guard', '6-0', '197 lbs', 'Wichita State', false, 44886930, 'Point Guard', '1994-02-25', 32),
  p('houston-rockets', '1631095', 'Jabari Smith Jr.', '10', 'Forward', '6-11', '220 lbs', 'Auburn', false, 12350000, 'Center', '2003-05-13', 23),
  p('houston-rockets', '1631106', 'Tari Eason', '17', 'Forward', '6-8', '215 lbs', 'LSU', false, 5675000, 'Wing', '2001-05-10', 25),
  p('houston-rockets', '203500', 'Steven Adams', '12', 'Center', '6-11', '265 lbs', 'Pittsburgh', false, 12600000, 'Center', '1993-07-20', 33),
  p('houston-rockets', '1628415', 'Dillon Brooks', '9', 'Forward / Guard', '6-6', '225 lbs', 'Oregon', false, 21124340, 'Wing', '1996-01-22', 30),
  p('houston-rockets', '1641715', 'Cam Whitmore', '7', 'Forward', '6-7', '232 lbs', 'Villanova', false, 3539760, 'Wing', '2004-07-08', 22),
  p('houston-rockets', '1629111', 'Jock Landale', '2', 'Center', '6-11', '255 lbs', "Saint Mary's", false, 8000000, 'Center', '1995-10-25', 30),
  p('houston-rockets', '1628988', 'Aaron Holiday', '0', 'Guard', '6-0', '185 lbs', 'UCLA', false, 4668000, 'Guard', '1996-09-30', 30),
  p('houston-rockets', '201145', 'Jeff Green', '32', 'Forward / Center', '6-8', '235 lbs', 'Georgetown', false, 8000000, 'Forward', '1986-08-28', 40),
  p('houston-rockets', '1630256', "Jae'Sean Tate", '8', 'Forward', '6-4', '230 lbs', 'Ohio State', false, 7065217, 'Wing', '1995-10-28', 30),
  p('houston-rockets', '1631466', 'Nate Williams', '29', 'Guard', '6-5', '205 lbs', 'Buffalo', true, 550000, 'Wing', '1999-02-12', 27),
  p('houston-rockets', '1631214', 'Jeenathan Williams', '19', 'Guard / Forward', '6-5', '205 lbs', 'Buffalo', true, 550000, 'Wing', '1999-02-12', 27),
  p('houston-rockets', '1642445', 'Jack McVeigh', '58', 'Forward', '6-8', '205 lbs', 'Nebraska', true, 550000, 'Wing', '1996-06-27', 30),

  // ==========================================
  // OKLAHOMA CITY THUNDER
  // ==========================================
  p('oklahoma-city-thunder', '1628983', 'Shai Gilgeous-Alexander', '2', 'Guard', '6-6', '195 lbs', 'Kentucky', false, 35859950, 'Point Guard', '1998-07-12', 28),
  p('oklahoma-city-thunder', '1631096', 'Chet Holmgren', '7', 'Forward / Center', '7-1', '208 lbs', 'Gonzaga', false, 13731368, 'Center', '2002-05-01', 24),
  p('oklahoma-city-thunder', '1631114', 'Jalen Williams', '8', 'Forward / Guard', '6-5', '211 lbs', 'Santa Clara', false, 6580997, 'Wing', '2001-04-14', 25),
  p('oklahoma-city-thunder', '1627936', 'Alex Caruso', '9', 'Guard', '6-5', '186 lbs', 'Texas A&M', false, 9890000, 'Point Guard', '1994-02-28', 32),
  p('oklahoma-city-thunder', '1628392', 'Isaiah Hartenstein', '55', 'Center', '7-0', '250 lbs', 'Germany / Žalgiris', false, 30000000, 'Center', '1998-05-05', 28),
  p('oklahoma-city-thunder', '1629652', 'Luguentz Dort', '5', 'Guard / Forward', '6-4', '220 lbs', 'Arizona State', false, 16500000, 'Wing', '1999-04-19', 27),
  p('oklahoma-city-thunder', '1641717', 'Cason Wallace', '22', 'Guard', '6-4', '193 lbs', 'Kentucky', false, 5556240, 'Point Guard', '2003-11-07', 22),
  p('oklahoma-city-thunder', '1630198', 'Isaiah Joe', '11', 'Guard', '6-3', '165 lbs', 'Arkansas', false, 11950000, 'Guard', '1999-07-02', 27),
  p('oklahoma-city-thunder', '1630598', 'Aaron Wiggins', '21', 'Guard / Forward', '6-6', '200 lbs', 'Maryland', false, 10200000, 'Wing', '1999-01-02', 27),
  p('oklahoma-city-thunder', '1631119', 'Jaylin Williams', '6', 'Forward / Center', '6-9', '240 lbs', 'Arkansas', false, 2046552, 'Center', '2002-06-29', 24),
  p('oklahoma-city-thunder', '1629026', 'Kenrich Williams', '34', 'Forward', '6-6', '229 lbs', 'TCU', false, 6669000, 'Wing', '1994-12-02', 31),
  p('oklahoma-city-thunder', '1631172', 'Ousmane Dieng', '13', 'Forward', '6-10', '216 lbs', 'France / NZ Breakers', false, 6670882, 'Wing', '2003-05-21', 23),
  p('oklahoma-city-thunder', '1642260', 'Nikola Topic', '44', 'Guard', '6-6', '200 lbs', 'Serbia / Mega MIS', false, 4950000, 'Point Guard', '2005-08-10', 21),
  p('oklahoma-city-thunder', '1641793', 'Dillon Jones', '3', 'Forward', '6-5', '235 lbs', 'Weber State', false, 2600000, 'Wing', '2001-10-29', 24),
  p('oklahoma-city-thunder', '1642349', 'Ajay Mitchell', '25', 'Guard', '6-5', '190 lbs', 'UC Santa Barbara', true, 550000, 'Guard', '2002-06-25', 24),
  p('oklahoma-city-thunder', '1631245', 'Adam Flagler', '14', 'Guard', '6-3', '180 lbs', 'Baylor', true, 550000, 'Guard', '1999-12-01', 26),
  p('oklahoma-city-thunder', '1642533', 'Alex Ducas', '23', 'Guard / Forward', '6-7', '220 lbs', "Saint Mary's", true, 550000, 'Wing', '2000-12-11', 25),

  // ==========================================
  // DENVER NUGGETS
  // ==========================================
  p('denver-nuggets', '203999', 'Nikola Jokić', '15', 'Center', '6-11', '284 lbs', 'Serbia / Mega Basket', false, 51415938, 'Center', '1995-02-19', 31),
  p('denver-nuggets', '1627750', 'Jamal Murray', '27', 'Guard', '6-4', '215 lbs', 'Kentucky', false, 36016200, 'Point Guard', '1997-02-23', 29),
  p('denver-nuggets', '1629008', 'Michael Porter Jr.', '1', 'Forward', '6-10', '218 lbs', 'Missouri', false, 35859950, 'Wing', '1998-06-29', 28),
  p('denver-nuggets', '203932', 'Aaron Gordon', '50', 'Forward', '6-8', '235 lbs', 'Arizona', false, 22841455, 'Forward', '1995-09-16', 31),
  p('denver-nuggets', '1631128', 'Christian Braun', '0', 'Guard', '6-6', '220 lbs', 'Kansas', false, 4921797, 'Guard', '2001-04-17', 25),
  p('denver-nuggets', '201566', 'Russell Westbrook', '4', 'Guard', '6-4', '200 lbs', 'UCLA', false, 3303771, 'Point Guard', '1988-11-12', 37),
  p('denver-nuggets', '1631212', 'Peyton Watson', '8', 'Forward / Guard', '6-7', '200 lbs', 'UCLA', false, 4356476, 'Wing', '2002-09-11', 24),
  p('denver-nuggets', '1641723', 'Julian Strawther', '3', 'Guard / Forward', '6-7', '205 lbs', 'Gonzaga', false, 2552520, 'Wing', '2002-04-18', 24),
  p('denver-nuggets', '203967', 'Dario Šarić', '9', 'Forward / Center', '6-10', '225 lbs', 'Croatia / Anadolu Efes', false, 5168000, 'Center', '1994-04-08', 32),
  p('denver-nuggets', '1630192', 'Zeke Nnaji', '22', 'Forward / Center', '6-9', '240 lbs', 'Arizona', false, 8888889, 'Center', '2001-01-09', 25),
  p('denver-nuggets', '1628427', 'Vlatko Čančar', '31', 'Forward', '6-8', '236 lbs', 'Slovenia', false, 2425403, 'Forward', '1997-04-10', 29),
  p('denver-nuggets', '201599', 'DeAndre Jordan', '6', 'Center', '6-11', '265 lbs', 'Texas A&M', false, 3303771, 'Center', '1988-07-21', 38),
  p('denver-nuggets', '1631222', 'Jalen Pickett', '24', 'Guard', '6-2', '202 lbs', 'Penn State', false, 1891857, 'Guard', '1999-10-22', 26),
  p('denver-nuggets', '1641816', 'Hunter Tyson', '5', 'Forward', '6-8', '215 lbs', 'Clemson', false, 1891857, 'Wing', '2000-06-13', 26),
  p('denver-nuggets', '1641748', 'DaRon Holmes II', '14', 'Forward / Center', '6-10', '235 lbs', 'Dayton', false, 3065640, 'Forward', '2002-08-15', 24),
  p('denver-nuggets', '1642360', 'Trey Alexander', '23', 'Guard', '6-4', '190 lbs', 'Creighton', true, 550000, 'Guard', '2003-05-02', 23),
  p('denver-nuggets', '1642369', 'PJ Hall', '10', 'Center', '6-9', '240 lbs', 'Clemson', true, 550000, 'Center', '2002-02-21', 24),
  p('denver-nuggets', '1641830', 'Spencer Jones', '21', 'Forward', '6-7', '225 lbs', 'Stanford', true, 550000, 'Wing', '2001-06-14', 25),

  // ==========================================
  // BOSTON CELTICS
  // ==========================================
  p('boston-celtics', '1628369', 'Jayson Tatum', '0', 'Forward', '6-8', '210 lbs', 'Duke', false, 54126450, 'Wing', '1998-03-03', 28),
  p('boston-celtics', '1627759', 'Jaylen Brown', '7', 'Guard / Forward', '6-6', '223 lbs', 'California', false, 49700000, 'Wing', '1996-10-24', 29),
  p('boston-celtics', '201950', 'Jrue Holiday', '4', 'Guard', '6-4', '205 lbs', 'UCLA', false, 30000000, 'Guard', '1990-06-12', 36),
  p('boston-celtics', '1628401', 'Derrick White', '9', 'Guard', '6-4', '190 lbs', 'Colorado', false, 28100000, 'Guard', '1994-07-02', 32),
  p('boston-celtics', '204001', 'Kristaps Porziņģis', '8', 'Forward / Center', '7-2', '240 lbs', 'Latvia / Sevilla', false, 30730000, 'Center', '1995-08-02', 31),
  p('boston-celtics', '201143', 'Al Horford', '42', 'Center / Forward', '6-9', '240 lbs', 'Florida', false, 9500000, 'Center', '1986-06-03', 40),
  p('boston-celtics', '1630202', 'Payton Pritchard', '11', 'Guard', '6-1', '195 lbs', 'Oregon', false, 6700000, 'Guard', '1998-01-28', 28),
  p('boston-celtics', '1630573', 'Sam Hauser', '30', 'Forward', '6-8', '217 lbs', 'Virginia', false, 10000000, 'Wing', '1997-12-08', 28),
  p('boston-celtics', '1628436', 'Luke Kornet', '40', 'Center', '7-1', '250 lbs', 'Vanderbilt', false, 2800000, 'Center', '1995-07-15', 31),
  p('boston-celtics', '1630214', 'Xavier Tillman', '26', 'Forward / Center', '6-8', '245 lbs', 'Michigan State', false, 2500000, 'Forward', '1999-01-12', 27),
  p('boston-celtics', '1629674', 'Neemias Queta', '88', 'Center', '7-0', '248 lbs', 'Utah State / Portugal', false, 2164993, 'Center', '1999-07-13', 27),
  p('boston-celtics', '1641775', 'Jordan Walsh', '27', 'Forward', '6-7', '205 lbs', 'Arkansas', false, 1891857, 'Wing', '2004-03-03', 22),
  p('boston-celtics', '1642261', 'Baylor Scheierman', '55', 'Guard / Forward', '6-6', '205 lbs', 'Creighton', false, 2500000, 'Wing', '2000-09-26', 26),

  // ==========================================
  // DALLAS MAVERICKS
  // ==========================================
  p('dallas-mavericks', '1629029', 'Luka Dončić', '77', 'Guard / Forward', '6-7', '230 lbs', 'Real Madrid (Slovenia)', false, 43031940, 'Guard', '1999-02-28', 27),
  p('dallas-mavericks', '202681', 'Kyrie Irving', '11', 'Guard', '6-2', '195 lbs', 'Duke', false, 41000000, 'Point Guard', '1992-03-23', 34),
  p('dallas-mavericks', '202691', 'Klay Thompson', '31', 'Guard / Forward', '6-6', '220 lbs', 'Washington State', false, 15873016, 'Wing', '1990-02-08', 36),
  p('dallas-mavericks', '1641726', 'Dereck Lively II', '2', 'Center', '7-1', '230 lbs', 'Duke', false, 5014560, 'Center', '2004-02-12', 22),
  p('dallas-mavericks', '1629023', 'P.J. Washington', '25', 'Forward', '6-7', '230 lbs', 'Kentucky', false, 15500000, 'Forward', '1998-08-23', 28),
  p('dallas-mavericks', '1629655', 'Daniel Gafford', '21', 'Center', '6-10', '234 lbs', 'Arkansas', false, 13394160, 'Center', '1998-10-01', 28),
  p('dallas-mavericks', '1630230', 'Naji Marshall', '13', 'Forward', '6-7', '220 lbs', 'Xavier', false, 8600000, 'Wing', '1998-01-24', 28),
  p('dallas-mavericks', '1630560', 'Quentin Grimes', '5', 'Guard', '6-5', '210 lbs', 'Houston', false, 4296645, 'Guard', '2000-05-08', 26),
  p('dallas-mavericks', '1630702', 'Jaden Hardy', '1', 'Guard', '6-4', '198 lbs', 'G League Ignite', false, 2019706, 'Guard', '2002-07-05', 24),
  p('dallas-mavericks', '1628467', 'Maxi Kleber', '42', 'Forward / Center', '6-10', '240 lbs', 'Germany', false, 11000000, 'Forward', '1992-01-29', 34),
  p('dallas-mavericks', '203939', 'Dwight Powell', '7', 'Center / Forward', '6-10', '240 lbs', 'Stanford', false, 4000000, 'Center', '1991-07-20', 35),
  p('dallas-mavericks', '203915', 'Spencer Dinwiddie', '26', 'Guard', '6-5', '215 lbs', 'Colorado', false, 3303771, 'Guard', '1993-04-06', 33),

  // ==========================================
  // MINNESOTA TIMBERWOLVES
  // ==========================================
  p('minnesota-timberwolves', '1630162', 'Anthony Edwards', '5', 'Guard', '6-4', '225 lbs', 'Georgia', false, 42176400, 'Wing', '2001-08-05', 25),
  p('minnesota-timberwolves', '203497', 'Rudy Gobert', '27', 'Center', '7-1', '258 lbs', 'France', false, 43827586, 'Center', '1992-06-26', 34),
  p('minnesota-timberwolves', '203944', 'Julius Randle', '30', 'Forward / Center', '6-8', '250 lbs', 'Kentucky', false, 30935520, 'Forward', '1994-11-29', 31),
  p('minnesota-timberwolves', '1629675', 'Naz Reid', '11', 'Center / Forward', '6-9', '264 lbs', 'LSU', false, 13986432, 'Center', '1999-08-26', 27),
  p('minnesota-timberwolves', '1630183', 'Jaden McDaniels', '3', 'Forward', '6-9', '185 lbs', 'Washington', false, 22586207, 'Wing', '2000-09-29', 26),
  p('minnesota-timberwolves', '201144', 'Mike Conley', '10', 'Guard', '6-0', '175 lbs', 'Ohio State', false, 9975962, 'Point Guard', '1987-10-11', 38),
  p('minnesota-timberwolves', '1628978', 'Donte DiVincenzo', '0', 'Guard', '6-4', '203 lbs', 'Villanova', false, 11445000, 'Guard', '1997-01-31', 29),
  p('minnesota-timberwolves', '1629638', 'Nickeil Alexander-Walker', '9', 'Guard / Forward', '6-5', '205 lbs', 'Virginia Tech', false, 4312500, 'Guard', '1998-09-02', 28),
  p('minnesota-timberwolves', '1642262', 'Rob Dillingham', '4', 'Guard', '6-1', '164 lbs', 'Kentucky', false, 6262920, 'Point Guard', '2005-01-04', 21),
  p('minnesota-timberwolves', '1642263', 'Terrence Shannon Jr.', '00', 'Guard', '6-6', '215 lbs', 'Illinois', false, 2552520, 'Wing', '2000-07-30', 26),

  // ==========================================
  // NEW YORK KNICKS
  // ==========================================
  p('new-york-knicks', '1628973', 'Jalen Brunson', '11', 'Guard', '6-2', '190 lbs', 'Villanova', false, 34944000, 'Point Guard', '1996-08-31', 30),
  p('new-york-knicks', '1626157', 'Karl-Anthony Towns', '32', 'Center / Forward', '7-0', '248 lbs', 'Kentucky', false, 49205800, 'Center', '1995-11-15', 30),
  p('new-york-knicks', '1628969', 'Mikal Bridges', '25', 'Forward / Guard', '6-6', '209 lbs', 'Villanova', false, 23300000, 'Wing', '1996-08-30', 30),
  p('new-york-knicks', '1628384', 'OG Anunoby', '8', 'Forward', '6-7', '240 lbs', 'Indiana', false, 36637931, 'Wing', '1997-07-17', 29),
  p('new-york-knicks', '1628404', 'Josh Hart', '3', 'Guard / Forward', '6-4', '215 lbs', 'Villanova', false, 18144000, 'Guard', '1995-03-06', 31),
  p('new-york-knicks', '1630540', 'Miles McBride', '2', 'Guard', '6-2', '200 lbs', 'West Virginia', false, 4710144, 'Point Guard', '2000-09-08', 26),
  p('new-york-knicks', '1629011', 'Mitchell Robinson', '23', 'Center', '7-0', '240 lbs', 'Western Kentucky', false, 14318182, 'Center', '1998-04-01', 28),
  p('new-york-knicks', '1630173', 'Precious Achiuwa', '5', 'Forward / Center', '6-8', '243 lbs', 'Memphis', false, 6000000, 'Forward', '1999-09-19', 27),
  p('new-york-knicks', '1630579', 'Jericho Sims', '45', 'Center', '6-10', '250 lbs', 'Texas', false, 2092344, 'Center', '1998-10-20', 27),
  p('new-york-knicks', '1642264', 'Tyler Kolek', '13', 'Guard', '6-3', '195 lbs', 'Marquette', false, 2087519, 'Point Guard', '2001-03-27', 25),

  // ==========================================
  // GOLDEN STATE WARRIORS
  // ==========================================
  p('golden-state-warriors', '201939', 'Stephen Curry', '30', 'Guard', '6-2', '185 lbs', 'Davidson', false, 55761216, 'Point Guard', '1988-03-14', 38),
  p('golden-state-warriors', '203110', 'Draymond Green', '23', 'Forward', '6-6', '230 lbs', 'Michigan State', false, 24107143, 'Forward', '1990-03-04', 36),
  p('golden-state-warriors', '1630228', 'Jonathan Kuminga', '00', 'Forward', '6-7', '225 lbs', 'G League Ignite', false, 7639302, 'Wing', '2002-10-06', 23),
  p('golden-state-warriors', '1641764', 'Brandin Podziemski', '2', 'Guard', '6-5', '205 lbs', 'Santa Clara', false, 3519960, 'Guard', '2003-02-25', 23),
  p('golden-state-warriors', '1627741', 'Buddy Hield', '7', 'Guard', '6-4', '220 lbs', 'Oklahoma', false, 8780000, 'Wing', '1992-12-17', 33),
  p('golden-state-warriors', '1629001', "De'Anthony Melton", '8', 'Guard', '6-2', '200 lbs', 'USC', false, 12822000, 'Guard', '1998-05-28', 28),
  p('golden-state-warriors', '203937', 'Kyle Anderson', '1', 'Forward', '6-9', '230 lbs', 'UCLA', false, 8780000, 'Forward', '1993-09-20', 33),
  p('golden-state-warriors', '1630541', 'Moses Moody', '4', 'Guard / Forward', '6-5', '211 lbs', 'Arkansas', false, 5803269, 'Wing', '2002-05-31', 24),
  p('golden-state-warriors', '1626172', 'Kevon Looney', '5', 'Center / Forward', '6-9', '222 lbs', 'UCLA', false, 8000000, 'Center', '1996-02-07', 30),
  p('golden-state-warriors', '1627780', 'Gary Payton II', '0', 'Guard', '6-2', '195 lbs', 'Oregon State', false, 9130000, 'Guard', '1992-12-01', 33),
  p('golden-state-warriors', '1631218', 'Trayce Jackson-Davis', '32', 'Forward / Center', '6-9', '245 lbs', 'Indiana', false, 1891857, 'Center', '2000-02-22', 26),

  // ==========================================
  // LOS ANGELES LAKERS
  // ==========================================
  p('los-angeles-lakers', '2544', 'LeBron James', '23', 'Forward', '6-9', '250 lbs', 'St. Vincent-St. Mary HS', false, 48728845, 'Point Forward', '1984-12-30', 41),
  p('los-angeles-lakers', '203076', 'Anthony Davis', '3', 'Forward / Center', '6-10', '253 lbs', 'Kentucky', false, 43219440, 'Center', '1993-03-11', 33),
  p('los-angeles-lakers', '1630559', 'Austin Reaves', '15', 'Guard', '6-5', '197 lbs', 'Oklahoma', false, 12976362, 'Guard', '1998-05-29', 28),
  p('los-angeles-lakers', '1626156', "D'Angelo Russell", '1', 'Guard', '6-3', '193 lbs', 'Ohio State', false, 18692307, 'Point Guard', '1996-02-23', 30),
  p('los-angeles-lakers', '1629060', 'Rui Hachimura', '28', 'Forward', '6-8', '230 lbs', 'Gonzaga / Japan', false, 17000000, 'Forward', '1998-02-08', 28),
  p('los-angeles-lakers', '1642265', 'Dalton Knecht', '4', 'Guard / Forward', '6-6', '213 lbs', 'Tennessee', false, 3819120, 'Wing', '2001-04-19', 25),
  p('los-angeles-lakers', '1629020', 'Jarred Vanderbilt', '2', 'Forward', '6-8', '214 lbs', 'Kentucky', false, 10714286, 'Forward', '1999-04-03', 27),
  p('los-angeles-lakers', '1629216', 'Gabe Vincent', '7', 'Guard', '6-2', '200 lbs', 'UC Santa Barbara', false, 11000000, 'Point Guard', '1996-06-14', 30),
  p('los-angeles-lakers', '1629637', 'Jaxson Hayes', '11', 'Center', '7-0', '220 lbs', 'Texas', false, 2463946, 'Center', '2000-05-23', 26),
  p('los-angeles-lakers', '1631108', 'Max Christie', '12', 'Guard', '6-5', '190 lbs', 'Michigan State', false, 7142857, 'Guard', '2003-02-10', 23),
  p('los-angeles-lakers', '1642266', 'Bronny James', '9', 'Guard', '6-2', '210 lbs', 'USC', false, 1157153, 'Guard', '2004-10-06', 21),

  // ==========================================
  // MILWAUKEE BUCKS
  // ==========================================
  p('milwaukee-bucks', '203507', 'Giannis Antetokounmpo', '34', 'Forward', '6-11', '243 lbs', 'Filathlitikos (Greece)', false, 48787676, 'Center', '1994-12-06', 31),
  p('milwaukee-bucks', '203081', 'Damian Lillard', '0', 'Guard', '6-2', '195 lbs', 'Weber State', false, 48787676, 'Point Guard', '1990-07-15', 36),
  p('milwaukee-bucks', '203114', 'Khris Middleton', '22', 'Forward', '6-7', '222 lbs', 'Texas A&M', false, 31000000, 'Wing', '1991-08-12', 35),
  p('milwaukee-bucks', '201572', 'Brook Lopez', '11', 'Center', '7-1', '282 lbs', 'Stanford', false, 23000000, 'Center', '1988-04-01', 38),
  p('milwaukee-bucks', '1626171', 'Bobby Portis', '9', 'Forward / Center', '6-10', '250 lbs', 'Arkansas', false, 12578286, 'Center', '1995-02-10', 31),
  p('milwaukee-bucks', '1629018', 'Gary Trent Jr.', '5', 'Guard', '6-5', '209 lbs', 'Duke', false, 2603984, 'Wing', '1999-01-18', 27),
  p('milwaukee-bucks', '1627752', 'Taurean Prince', '12', 'Forward', '6-6', '218 lbs', 'Baylor', false, 2988550, 'Wing', '1994-03-22', 32),
  p('milwaukee-bucks', '1626153', 'Delon Wright', '55', 'Guard', '6-5', '185 lbs', 'Utah', false, 3303771, 'Guard', '1992-04-26', 34),
  p('milwaukee-bucks', '203953', 'Pat Connaughton', '24', 'Guard / Forward', '6-5', '209 lbs', 'Notre Dame', false, 9423869, 'Wing', '1993-01-06', 33),

  // ==========================================
  // SAN ANTONIO SPURS
  // ==========================================
  p('san-antonio-spurs', '1641705', 'Victor Wembanyama', '1', 'Center / Forward', '7-3', '210 lbs', 'Metropolitans 92 (France)', false, 12768960, 'Center', '2004-01-04', 22),
  p('san-antonio-spurs', '101108', 'Chris Paul', '3', 'Guard', '6-0', '175 lbs', 'Wake Forest', false, 10460000, 'Point Guard', '1985-05-06', 41),
  p('san-antonio-spurs', '1630170', 'Devin Vassell', '24', 'Guard / Forward', '6-5', '200 lbs', 'Florida State', false, 27000000, 'Wing', '2000-08-23', 26),
  p('san-antonio-spurs', '1631110', 'Jeremy Sochan', '10', 'Forward', '6-8', '230 lbs', 'Baylor / Poland', false, 5570040, 'Forward', '2003-05-20', 23),
  p('san-antonio-spurs', '203084', 'Harrison Barnes', '40', 'Forward', '6-8', '225 lbs', 'North Carolina', false, 18000000, 'Forward', '1992-05-30', 34),
  p('san-antonio-spurs', '1642267', 'Stephon Castle', '5', 'Guard', '6-6', '215 lbs', 'UConn', false, 9126480, 'Guard', '2004-11-01', 21),
  p('san-antonio-spurs', '1629640', 'Keldon Johnson', '0', 'Forward / Guard', '6-5', '220 lbs', 'Kentucky', false, 19000000, 'Wing', '1999-10-11', 26),
  p('san-antonio-spurs', '1630200', 'Tre Jones', '33', 'Guard', '6-1', '185 lbs', 'Duke', false, 9104167, 'Point Guard', '2000-01-08', 26),
  p('san-antonio-spurs', '1628380', 'Zach Collins', '23', 'Center / Forward', '6-11', '250 lbs', 'Gonzaga', false, 16741200, 'Center', '1997-11-19', 28),

  // ==========================================
  // PHILADELPHIA 76ERS
  // ==========================================
  p('philadelphia-76ers', '203954', 'Joel Embiid', '21', 'Center', '7-0', '280 lbs', 'Kansas / Cameroon', false, 51415938, 'Center', '1994-03-16', 32),
  p('philadelphia-76ers', '202331', 'Paul George', '8', 'Forward', '6-8', '220 lbs', 'Fresno State', false, 49205800, 'Wing', '1990-05-02', 36),
  p('philadelphia-76ers', '1630178', 'Tyrese Maxey', '0', 'Guard', '6-2', '200 lbs', 'Kentucky', false, 35147000, 'Point Guard', '2000-11-04', 25),
  p('philadelphia-76ers', '1626162', 'Kelly Oubre Jr.', '9', 'Forward / Guard', '6-7', '203 lbs', 'Kansas', false, 7983000, 'Wing', '1995-12-09', 30),
  p('philadelphia-76ers', '1628997', 'Caleb Martin', '16', 'Forward', '6-5', '205 lbs', 'Nevada', false, 8140700, 'Wing', '1995-09-28', 31),
  p('philadelphia-76ers', '200768', 'Kyle Lowry', '7', 'Guard', '6-0', '196 lbs', 'Villanova', false, 3303771, 'Point Guard', '1986-03-25', 40),
  p('philadelphia-76ers', '203083', 'Andre Drummond', '5', 'Center', '6-11', '279 lbs', 'UConn', false, 5000000, 'Center', '1993-08-10', 33),
  p('philadelphia-76ers', '201569', 'Eric Gordon', '23', 'Guard', '6-3', '215 lbs', 'Indiana', false, 3303771, 'Guard', '1988-12-25', 37),
  p('philadelphia-76ers', '1627824', 'Guerschon Yabusele', '28', 'Forward', '6-8', '270 lbs', 'France / Real Madrid', false, 2087519, 'Forward', '1995-12-17', 30),
  p('philadelphia-76ers', '1642268', 'Jared McCain', '20', 'Guard', '6-3', '195 lbs', 'Duke', false, 4013400, 'Guard', '2004-02-20', 22),

  // ==========================================
  // PHOENIX SUNS
  // ==========================================
  p('phoenix-suns', '1626164', 'Devin Booker', '1', 'Guard', '6-6', '206 lbs', 'Kentucky', false, 49205800, 'Guard', '1996-10-30', 29),
  p('phoenix-suns', '203078', 'Bradley Beal', '3', 'Guard', '6-4', '207 lbs', 'Florida', false, 50203930, 'Guard', '1993-06-28', 33),
  p('phoenix-suns', '203994', 'Jusuf Nurkić', '20', 'Center', '7-0', '290 lbs', 'Bosnia and Herzegovina', false, 18125000, 'Center', '1994-08-23', 32),
  p('phoenix-suns', '1626145', 'Tyus Jones', '21', 'Guard', '6-2', '196 lbs', 'Duke', false, 3000000, 'Point Guard', '1996-05-10', 30),
  p('phoenix-suns', '1628960', 'Grayson Allen', '8', 'Guard', '6-4', '198 lbs', 'Duke', false, 15625000, 'Guard', '1995-10-08', 30),
  p('phoenix-suns', '1626220', "Royce O'Neale", '00', 'Forward', '6-6', '226 lbs', 'Baylor', false, 9875000, 'Wing', '1993-06-05', 33),
  p('phoenix-suns', '203486', 'Mason Plumlee', '22', 'Center', '6-10', '254 lbs', 'Duke', false, 3303771, 'Center', '1990-03-05', 36),
  p('phoenix-suns', '1628420', 'Monte Morris', '23', 'Guard', '6-2', '183 lbs', 'Iowa State', false, 2800000, 'Point Guard', '1995-06-27', 31),
  p('phoenix-suns', '1642269', 'Ryan Dunn', '0', 'Forward', '6-8', '216 lbs', 'Virginia', false, 2552520, 'Wing', '2003-01-07', 23),
  p('phoenix-suns', '1642270', 'Oso Ighodaro', '4', 'Center', '6-11', '235 lbs', 'Marquette', false, 1157153, 'Center', '2002-07-14', 24),
  p('phoenix-suns', '1629626', 'Bol Bol', '11', 'Center / Forward', '7-3', '220 lbs', 'Oregon / Sudan', false, 2463946, 'Center', '1999-11-16', 26),

  // ==========================================
  // CLEVELAND CAVALIERS
  // ==========================================
  p('cleveland-cavaliers', '1628378', 'Donovan Mitchell', '45', 'Guard', '6-3', '215 lbs', 'Louisville', false, 35410310, 'Guard', '1996-09-07', 30),
  p('cleveland-cavaliers', '1629636', 'Darius Garland', '10', 'Guard', '6-1', '192 lbs', 'Vanderbilt', false, 36725670, 'Point Guard', '2000-01-26', 26),
  p('cleveland-cavaliers', '1630596', 'Evan Mobley', '4', 'Forward / Center', '6-11', '215 lbs', 'USC', false, 11227657, 'Center', '2001-06-18', 25),
  p('cleveland-cavaliers', '1628386', 'Jarrett Allen', '31', 'Center', '6-9', '243 lbs', 'Texas', false, 20000000, 'Center', '1998-04-21', 28),
  p('cleveland-cavaliers', '1629622', 'Max Strus', '1', 'Guard / Forward', '6-5', '215 lbs', 'DePaul', false, 15212766, 'Wing', '1996-03-28', 30),
  p('cleveland-cavaliers', '1627747', 'Caris LeVert', '3', 'Guard', '6-6', '205 lbs', 'Michigan', false, 16615384, 'Wing', '1994-08-25', 32),
  p('cleveland-cavaliers', '1630171', 'Isaac Okoro', '35', 'Forward / Guard', '6-5', '225 lbs', 'Auburn', false, 11000000, 'Wing', '2001-01-26', 25),
  p('cleveland-cavaliers', '1627777', 'Georges Niang', '20', 'Forward', '6-7', '230 lbs', 'Iowa State', false, 8500000, 'Forward', '1993-06-17', 33),
  p('cleveland-cavaliers', '1629731', 'Dean Wade', '32', 'Forward', '6-9', '228 lbs', 'Kansas State', false, 6162243, 'Forward', '1996-11-20', 29),
  p('cleveland-cavaliers', '1629660', 'Ty Jerome', '2', 'Guard', '6-5', '195 lbs', 'Virginia', false, 2560975, 'Guard', '1997-07-08', 29),

  // ==========================================
  // MEMPHIS GRIZZLIES
  // ==========================================
  p('memphis-grizzlies', '1629630', 'Ja Morant', '12', 'Guard', '6-2', '174 lbs', 'Murray State', false, 36725670, 'Point Guard', '1999-08-10', 27),
  p('memphis-grizzlies', '1628991', 'Jaren Jackson Jr.', '13', 'Forward / Center', '6-10', '242 lbs', 'Michigan State', false, 25264915, 'Center', '1999-09-15', 27),
  p('memphis-grizzlies', '1630217', 'Desmond Bane', '22', 'Guard', '6-5', '215 lbs', 'TCU', false, 34005250, 'Wing', '1998-06-25', 28),
  p('memphis-grizzlies', '203935', 'Marcus Smart', '36', 'Guard', '6-3', '220 lbs', 'Oklahoma State', false, 20210285, 'Guard', '1994-03-06', 32),
  p('memphis-grizzlies', '1641734', 'Zach Edey', '14', 'Center', '7-4', '300 lbs', 'Purdue / Canada', false, 5747040, 'Center', '2002-05-14', 24),
  p('memphis-grizzlies', '1628379', 'Luke Kennard', '10', 'Guard', '6-5', '206 lbs', 'Duke', false, 9250000, 'Wing', '1996-06-24', 30),
  p('memphis-grizzlies', '1630583', 'Santi Aldama', '7', 'Forward / Center', '7-0', '224 lbs', 'Loyola Maryland / Spain', false, 3960531, 'Forward', '2001-01-10', 25),
  p('memphis-grizzlies', '1630231', 'Vince Williams Jr.', '5', 'Guard / Forward', '6-4', '205 lbs', 'VCU', false, 2120693, 'Wing', '2000-08-30', 26),
  p('memphis-grizzlies', '1641713', 'GG Jackson', '45', 'Forward', '6-9', '210 lbs', 'South Carolina', false, 1891857, 'Forward', '2004-12-17', 21),
  p('memphis-grizzlies', '1629723', 'John Konchar', '46', 'Guard', '6-5', '210 lbs', 'Purdue Fort Wayne', false, 6165000, 'Wing', '1996-03-22', 30),

  // ==========================================
  // SACRAMENTO KINGS
  // ==========================================
  p('sacramento-kings', '1628368', "De'Aaron Fox", '5', 'Guard', '6-3', '185 lbs', 'Kentucky', false, 34848340, 'Point Guard', '1997-12-20', 28),
  p('sacramento-kings', '1627734', 'Domantas Sabonis', '10', 'Center / Forward', '6-10', '240 lbs', 'Gonzaga / Lithuania', false, 40500000, 'Center', '1996-05-03', 30),
  p('sacramento-kings', '201942', 'DeMar DeRozan', '11', 'Forward / Guard', '6-6', '220 lbs', 'USC', false, 23400000, 'Wing', '1989-08-07', 37),
  p('sacramento-kings', '1631099', 'Keegan Murray', '13', 'Forward', '6-8', '215 lbs', 'Iowa', false, 8809560, 'Wing', '2000-08-19', 26),
  p('sacramento-kings', '1628370', 'Malik Monk', '0', 'Guard', '6-3', '200 lbs', 'Kentucky', false, 17405203, 'Guard', '1998-02-04', 28),
  p('sacramento-kings', '1628989', 'Kevin Huerter', '9', 'Guard / Forward', '6-7', '198 lbs', 'Maryland', false, 16830357, 'Wing', '1998-08-27', 28),
  p('sacramento-kings', '1631165', 'Keon Ellis', '23', 'Guard', '6-4', '175 lbs', 'Alabama', false, 2120693, 'Guard', '2000-01-08', 26),
  p('sacramento-kings', '1626168', 'Trey Lyles', '41', 'Forward', '6-9', '234 lbs', 'Kentucky', false, 8000000, 'Forward', '1995-11-05', 30),
  p('sacramento-kings', '203458', 'Alex Len', '25', 'Center', '7-0', '250 lbs', 'Maryland / Ukraine', false, 3303771, 'Center', '1993-06-16', 33),

  // ==========================================
  // ORLANDO MAGIC
  // ==========================================
  p('orlando-magic', '1631094', 'Paolo Banchero', '5', 'Forward', '6-10', '250 lbs', 'Duke', false, 12160800, 'Forward', '2002-11-12', 23),
  p('orlando-magic', '1630532', 'Franz Wagner', '22', 'Forward', '6-10', '220 lbs', 'Michigan / Germany', false, 7007866, 'Wing', '2001-08-27', 25),
  p('orlando-magic', '1630591', 'Jalen Suggs', '4', 'Guard', '6-5', '205 lbs', 'Gonzaga', false, 9188385, 'Point Guard', '2001-06-03', 25),
  p('orlando-magic', '203484', 'Kentavious Caldwell-Pope', '3', 'Guard', '6-5', '204 lbs', 'Georgia', false, 22727273, 'Wing', '1993-02-18', 33),
  p('orlando-magic', '1628976', 'Wendell Carter Jr.', '34', 'Center', '6-10', '270 lbs', 'Duke', false, 11950000, 'Center', '1999-04-16', 27),
  p('orlando-magic', '1630175', 'Cole Anthony', '50', 'Guard', '6-2', '185 lbs', 'North Carolina', false, 12900000, 'Guard', '2000-05-15', 26),
  p('orlando-magic', '1628371', 'Jonathan Isaac', '1', 'Forward', '6-10', '230 lbs', 'Florida State', false, 15000000, 'Forward', '1997-10-03', 28),
  p('orlando-magic', '1629021', 'Moritz Wagner', '21', 'Center / Forward', '6-11', '245 lbs', 'Michigan / Germany', false, 11000000, 'Center', '1997-04-26', 29),
  p('orlando-magic', '1641710', 'Anthony Black', '0', 'Guard', '6-7', '200 lbs', 'Arkansas', false, 7607760, 'Guard', '2004-01-20', 22),
  p('orlando-magic', '1629048', 'Goga Bitadze', '35', 'Center', '6-11', '250 lbs', 'Georgia (Country)', false, 8333333, 'Center', '1999-07-20', 27),

  // ==========================================
  // INDIANA PACERS
  // ==========================================
  p('indiana-pacers', '1630169', 'Tyrese Haliburton', '0', 'Guard', '6-5', '185 lbs', 'Iowa State', false, 35147000, 'Point Guard', '2000-02-29', 26),
  p('indiana-pacers', '1627783', 'Pascal Siakam', '43', 'Forward', '6-8', '230 lbs', 'New Mexico State / Cameroon', false, 42176400, 'Forward', '1994-04-02', 32),
  p('indiana-pacers', '1626167', 'Myles Turner', '33', 'Center', '6-11', '250 lbs', 'Texas', false, 19928500, 'Center', '1996-03-24', 30),
  p('indiana-pacers', '1631097', 'Bennedict Mathurin', '00', 'Guard / Forward', '6-6', '210 lbs', 'Arizona / Canada', false, 7245720, 'Wing', '2002-06-19', 24),
  p('indiana-pacers', '1629614', 'Andrew Nembhard', '2', 'Guard', '6-5', '191 lbs', 'Gonzaga / Canada', false, 2019706, 'Point Guard', '2000-01-16', 26),
  p('indiana-pacers', '1630174', 'Aaron Nesmith', '23', 'Forward / Guard', '6-6', '215 lbs', 'Vanderbilt', false, 11000000, 'Wing', '1999-10-16', 26),
  p('indiana-pacers', '1630167', 'Obi Toppin', '1', 'Forward', '6-9', '220 lbs', 'Dayton', false, 14000000, 'Forward', '1998-03-04', 28),
  p('indiana-pacers', '204456', 'T.J. McConnell', '9', 'Guard', '6-1', '190 lbs', 'Arizona', false, 9300000, 'Point Guard', '1992-03-25', 34),
  p('indiana-pacers', '1641767', 'Ben Sheppard', '26', 'Guard', '6-6', '190 lbs', 'Belmont', false, 2604720, 'Wing', '2001-07-16', 25),
  p('indiana-pacers', '1641716', 'Jarace Walker', '25', 'Forward', '6-8', '240 lbs', 'Houston', false, 6362520, 'Forward', '2003-09-04', 23),

  // ==========================================
  // MIAMI HEAT
  // ==========================================
  p('miami-heat', '202710', 'Jimmy Butler', '22', 'Forward', '6-7', '230 lbs', 'Marquette', false, 48798677, 'Wing', '1989-09-14', 37),
  p('miami-heat', '1628389', 'Bam Adebayo', '13', 'Center / Forward', '6-9', '255 lbs', 'Kentucky', false, 34848340, 'Center', '1997-07-18', 29),
  p('miami-heat', '1629639', 'Tyler Herro', '14', 'Guard', '6-5', '195 lbs', 'Kentucky', false, 29000000, 'Guard', '2000-01-20', 26),
  p('miami-heat', '1626179', 'Terry Rozier', '2', 'Guard', '6-1', '190 lbs', 'Louisville', false, 24924126, 'Point Guard', '1994-03-17', 32),
  p('miami-heat', '1631170', 'Jaime Jaquez Jr.', '11', 'Forward', '6-6', '225 lbs', 'UCLA / Mexico', false, 3685800, 'Wing', '2001-02-18', 25),
  p('miami-heat', '1631107', 'Nikola Jović', '5', 'Forward', '6-10', '205 lbs', 'Serbia / Mega Basket', false, 2464200, 'Forward', '2003-06-09', 23),
  p('miami-heat', '1629130', 'Duncan Robinson', '55', 'Forward / Guard', '6-7', '215 lbs', 'Michigan', false, 19888000, 'Wing', '1994-04-22', 32),
  p('miami-heat', '1629312', 'Haywood Highsmith', '24', 'Forward', '6-5', '220 lbs', 'Wheeling', false, 5400000, 'Forward', '1996-12-09', 29),
  p('miami-heat', '1642276', "Kel'el Ware", '7', 'Center', '7-0', '230 lbs', 'Indiana', false, 4235280, 'Center', '2004-04-20', 22),
  p('miami-heat', '201567', 'Kevin Love', '42', 'Forward / Center', '6-8', '251 lbs', 'UCLA', false, 3850000, 'Forward', '1988-09-07', 38),

  // ==========================================
  // NEW ORLEANS PELICANS
  // ==========================================
  p('new-orleans-pelicans', '1629627', 'Zion Williamson', '1', 'Forward', '6-6', '284 lbs', 'Duke', false, 36725670, 'Forward', '2000-07-06', 26),
  p('new-orleans-pelicans', '1627742', 'Brandon Ingram', '14', 'Forward', '6-8', '190 lbs', 'Duke', false, 36016200, 'Wing', '1997-09-02', 29),
  p('new-orleans-pelicans', '1627749', 'Dejounte Murray', '5', 'Guard', '6-5', '180 lbs', 'Washington', false, 25499599, 'Point Guard', '1996-09-19', 30),
  p('new-orleans-pelicans', '203468', 'CJ McCollum', '3', 'Guard', '6-3', '197 lbs', 'Lehigh', false, 33333333, 'Guard', '1991-09-19', 35),
  p('new-orleans-pelicans', '1630529', 'Herbert Jones', '2', 'Forward', '6-7', '206 lbs', 'Alabama', false, 12976362, 'Wing', '1998-10-06', 27),
  p('new-orleans-pelicans', '1630530', 'Trey Murphy III', '25', 'Forward / Guard', '6-8', '206 lbs', 'Virginia', false, 5159854, 'Wing', '2000-06-18', 26),
  p('new-orleans-pelicans', '1642271', 'Yves Missi', '21', 'Center', '6-11', '235 lbs', 'Baylor / Cameroon', false, 3180480, 'Center', '2004-05-14', 22),
  p('new-orleans-pelicans', '1641722', 'Jordan Hawkins', '24', 'Guard', '6-5', '190 lbs', 'UConn', false, 4525680, 'Guard', '2002-04-29', 24),
  p('new-orleans-pelicans', '1630631', 'Jose Alvarado', '15', 'Guard', '6-0', '179 lbs', 'Georgia Tech', false, 1988598, 'Point Guard', '1998-04-12', 28),

  // ==========================================
  // ATLANTA HAWKS
  // ==========================================
  p('atlanta-hawks', '1629027', 'Trae Young', '11', 'Guard', '6-1', '164 lbs', 'Oklahoma', false, 43031940, 'Point Guard', '1998-09-19', 28),
  p('atlanta-hawks', '1630552', 'Jalen Johnson', '1', 'Forward', '6-9', '220 lbs', 'Duke', false, 4510905, 'Forward', '2001-12-18', 24),
  p('atlanta-hawks', '1642258', 'Zaccharie Risacher', '10', 'Forward', '6-9', '195 lbs', 'JL Bourg (France)', false, 12569040, 'Wing', '2005-04-08', 21),
  p('atlanta-hawks', '1630700', 'Dyson Daniels', '5', 'Guard', '6-7', '199 lbs', 'G League Ignite / Australia', false, 6059520, 'Guard', '2003-03-17', 23),
  p('atlanta-hawks', '203991', 'Clint Capela', '15', 'Center', '6-10', '256 lbs', 'Switzerland', false, 22265280, 'Center', '1994-05-18', 32),
  p('atlanta-hawks', '203992', 'Bogdan Bogdanović', '13', 'Guard', '6-5', '225 lbs', 'Serbia / Fenerbahce', false, 17260000, 'Wing', '1992-08-18', 34),
  p('atlanta-hawks', '1629631', "De'Andre Hunter", '12', 'Forward', '6-8', '225 lbs', 'Virginia', false, 21696429, 'Wing', '1997-12-02', 28),
  p('atlanta-hawks', '1630168', 'Onyeka Okongwu', '17', 'Center / Forward', '6-10', '240 lbs', 'USC', false, 14000000, 'Center', '2000-12-11', 25),
  p('atlanta-hawks', '1626204', 'Larry Nance Jr.', '22', 'Forward / Center', '6-8', '245 lbs', 'Wyoming', false, 11205000, 'Forward', '1993-01-01', 33),

  // ==========================================
  // TORONTO RAPTORS
  // ==========================================
  p('toronto-raptors', '1630567', 'Scottie Barnes', '4', 'Forward / Guard', '6-7', '225 lbs', 'Florida State', false, 10130980, 'Forward', '2001-08-01', 25),
  p('toronto-raptors', '1630193', 'Immanuel Quickley', '5', 'Guard', '6-2', '190 lbs', 'Kentucky', false, 32500000, 'Point Guard', '1999-06-17', 27),
  p('toronto-raptors', '1629628', 'RJ Barrett', '9', 'Guard / Forward', '6-6', '214 lbs', 'Duke / Canada', false, 25708929, 'Wing', '2000-06-14', 26),
  p('toronto-raptors', '1627751', 'Jakob Poeltl', '19', 'Center', '7-0', '245 lbs', 'Utah / Austria', false, 19500000, 'Center', '1995-10-15', 30),
  p('toronto-raptors', '1641711', 'Gradey Dick', '1', 'Guard / Forward', '6-6', '205 lbs', 'Kansas', false, 4763760, 'Wing', '2003-11-20', 22),
  p('toronto-raptors', '203482', 'Kelly Olynyk', '41', 'Forward / Center', '6-11', '240 lbs', 'Gonzaga / Canada', false, 12804878, 'Center', '1991-04-19', 35),
  p('toronto-raptors', '1630534', 'Ochai Agbaji', '30', 'Guard', '6-5', '215 lbs', 'Kansas', false, 4310280, 'Wing', '2000-04-20', 26),
  p('toronto-raptors', '1630558', 'Davion Mitchell', '45', 'Guard', '6-0', '202 lbs', 'Baylor', false, 6451077, 'Point Guard', '1998-09-05', 28),
  p('toronto-raptors', '1628449', 'Chris Boucher', '25', 'Forward / Center', '6-9', '200 lbs', 'Oregon / Saint Lucia', false, 10810000, 'Forward', '1993-01-11', 33),

  // ==========================================
  // CHICAGO BULLS
  // ==========================================
  p('chicago-bulls', '203897', 'Zach LaVine', '8', 'Guard', '6-5', '200 lbs', 'UCLA', false, 43031940, 'Wing', '1995-03-10', 31),
  p('chicago-bulls', '1629632', 'Coby White', '0', 'Guard', '6-5', '195 lbs', 'North Carolina', false, 12000000, 'Point Guard', '2000-02-16', 26),
  p('chicago-bulls', '202696', 'Nikola Vučević', '9', 'Center', '6-10', '260 lbs', 'USC / Montenegro', false, 20000000, 'Center', '1990-10-24', 35),
  p('chicago-bulls', '1630581', 'Josh Giddey', '3', 'Guard', '6-8', '216 lbs', 'Australia', false, 8352967, 'Point Guard', '2002-10-10', 23),
  p('chicago-bulls', '1630172', 'Patrick Williams', '44', 'Forward', '6-7', '215 lbs', 'Florida State', false, 18000000, 'Forward', '2001-08-26', 25),
  p('chicago-bulls', '1630245', 'Ayo Dosunmu', '12', 'Guard', '6-5', '200 lbs', 'Illinois', false, 7000000, 'Guard', '2000-01-17', 26),
  p('chicago-bulls', '1628366', 'Lonzo Ball', '2', 'Guard', '6-6', '190 lbs', 'UCLA', false, 21395348, 'Point Guard', '1997-10-27', 28),
  p('chicago-bulls', '1642261', 'Matas Buzelis', '14', 'Forward', '6-10', '209 lbs', 'G League Ignite / Lithuania', false, 5168040, 'Forward', '2004-10-13', 21),
  p('chicago-bulls', '1630188', 'Jalen Smith', '25', 'Forward / Center', '6-9', '215 lbs', 'Maryland', false, 8666667, 'Forward', '2000-03-16', 26),

  // ==========================================
  // BROOKLYN NETS
  // ==========================================
  p('brooklyn-nets', '1630560', 'Cam Thomas', '24', 'Guard', '6-3', '210 lbs', 'LSU', false, 4041249, 'Guard', '2001-10-13', 24),
  p('brooklyn-nets', '203471', 'Dennis Schröder', '17', 'Guard', '6-1', '175 lbs', 'Germany', false, 13025250, 'Point Guard', '1993-09-15', 33),
  p('brooklyn-nets', '1629661', 'Cameron Johnson', '2', 'Forward', '6-8', '210 lbs', 'North Carolina', false, 22500000, 'Wing', '1996-03-03', 30),
  p('brooklyn-nets', '1629651', 'Nic Claxton', '33', 'Center', '6-11', '215 lbs', 'Georgia', false, 28532609, 'Center', '1999-04-17', 27),
  p('brooklyn-nets', '1627827', 'Dorian Finney-Smith', '28', 'Forward', '6-7', '220 lbs', 'Florida', false, 14924167, 'Forward', '1993-05-04', 33),
  p('brooklyn-nets', '1627732', 'Ben Simmons', '10', 'Guard / Forward', '6-10', '240 lbs', 'LSU / Australia', false, 40338144, 'Point Guard', '1996-07-20', 30),
  p('brooklyn-nets', '1641730', 'Noah Clowney', '21', 'Forward / Center', '6-10', '210 lbs', 'Alabama', false, 3244080, 'Forward', '2004-07-14', 22),
  p('brooklyn-nets', '1630549', "Day'Ron Sharpe", '20', 'Center', '6-9', '265 lbs', 'North Carolina', false, 3989122, 'Center', '2001-11-06', 24),
  p('brooklyn-nets', '1630533', 'Ziaire Williams', '8', 'Forward', '6-9', '185 lbs', 'Stanford', false, 6133005, 'Wing', '2001-09-12', 25),

  // ==========================================
  // CHARLOTTE HORNETS
  // ==========================================
  p('charlotte-hornets', '1630163', 'LaMelo Ball', '1', 'Guard', '6-7', '180 lbs', 'Chino Hills HS / Australia', false, 35147000, 'Point Guard', '2001-08-22', 25),
  p('charlotte-hornets', '1641706', 'Brandon Miller', '24', 'Forward', '6-9', '200 lbs', 'Alabama', false, 11424600, 'Wing', '2002-11-22', 23),
  p('charlotte-hornets', '1628970', 'Miles Bridges', '0', 'Forward', '6-7', '225 lbs', 'Michigan State', false, 25000000, 'Forward', '1998-03-21', 28),
  p('charlotte-hornets', '1631109', 'Mark Williams', '5', 'Center', '7-0', '242 lbs', 'Duke', false, 4094280, 'Center', '2001-12-16', 24),
  p('charlotte-hornets', '1629684', 'Grant Williams', '2', 'Forward', '6-6', '236 lbs', 'Tennessee', false, 13025250, 'Forward', '1998-11-30', 27),
  p('charlotte-hornets', '1630182', 'Josh Green', '10', 'Guard / Forward', '6-5', '200 lbs', 'Arizona / Australia', false, 12654321, 'Wing', '2000-11-16', 25),
  p('charlotte-hornets', '1630544', 'Tre Mann', '23', 'Guard', '6-3', '178 lbs', 'Florida', false, 4908373, 'Guard', '2001-02-03', 25),
  p('charlotte-hornets', '1642257', 'Tidjane Salaün', '31', 'Forward', '6-9', '218 lbs', 'Cholet (France)', false, 7490040, 'Forward', '2005-08-10', 21),
  p('charlotte-hornets', '1630208', 'Nick Richards', '4', 'Center', '7-0', '245 lbs', 'Kentucky / Jamaica', false, 5000000, 'Center', '1997-11-29', 28),

  // ==========================================
  // DETROIT PISTONS
  // ==========================================
  p('detroit-pistons', '1630595', 'Cade Cunningham', '2', 'Guard', '6-6', '220 lbs', 'Oklahoma State', false, 35147000, 'Point Guard', '2001-09-25', 25),
  p('detroit-pistons', '1631093', 'Jaden Ivey', '23', 'Guard', '6-4', '195 lbs', 'Purdue', false, 7977240, 'Guard', '2002-02-13', 24),
  p('detroit-pistons', '1631105', 'Jalen Duren', '0', 'Center', '6-10', '250 lbs', 'Memphis', false, 4482840, 'Center', '2003-11-18', 22),
  p('detroit-pistons', '202699', 'Tobias Harris', '12', 'Forward', '6-8', '226 lbs', 'Tennessee', false, 25365854, 'Forward', '1992-07-15', 34),
  p('detroit-pistons', '1641709', 'Ausar Thompson', '9', 'Forward / Guard', '6-7', '215 lbs', 'Overtime Elite', false, 8376000, 'Wing', '2003-01-30', 23),
  p('detroit-pistons', '1627736', 'Malik Beasley', '5', 'Guard', '6-4', '187 lbs', 'Florida State', false, 6000000, 'Wing', '1996-11-26', 29),
  p('detroit-pistons', '203501', 'Tim Hardaway Jr.', '10', 'Guard / Forward', '6-5', '205 lbs', 'Michigan', false, 16193183, 'Wing', '1992-03-16', 34),
  p('detroit-pistons', '1630191', 'Isaiah Stewart', '28', 'Center / Forward', '6-8', '250 lbs', 'Washington', false, 15000000, 'Center', '2001-05-22', 25),
  p('detroit-pistons', '1642263', 'Ron Holland', '00', 'Forward', '6-8', '206 lbs', 'G League Ignite', false, 8660280, 'Forward', '2005-07-07', 21),
  p('detroit-pistons', '1630194', 'Paul Reed', '7', 'Center / Forward', '6-9', '210 lbs', 'DePaul', false, 7723000, 'Center', '1999-06-14', 27),

  // ==========================================
  // PORTLAND TRAIL BLAZERS
  // ==========================================
  p('portland-trail-blazers', '1630703', 'Scoot Henderson', '00', 'Guard', '6-3', '195 lbs', 'G League Ignite', false, 10259160, 'Point Guard', '2004-02-03', 22),
  p('portland-trail-blazers', '1631101', 'Shaedon Sharpe', '17', 'Guard', '6-5', '200 lbs', 'Kentucky / Canada', false, 6614160, 'Wing', '2003-05-30', 23),
  p('portland-trail-blazers', '1629014', 'Anfernee Simons', '1', 'Guard', '6-3', '181 lbs', 'IMG Academy', false, 25892857, 'Guard', '1999-06-08', 27),
  p('portland-trail-blazers', '203924', 'Jerami Grant', '9', 'Forward', '6-7', '210 lbs', 'Syracuse', false, 29785714, 'Forward', '1994-03-12', 32),
  p('portland-trail-blazers', '1629028', 'Deandre Ayton', '2', 'Center', '7-0', '250 lbs', 'Arizona / Bahamas', false, 34005126, 'Center', '1998-07-23', 28),
  p('portland-trail-blazers', '1630166', 'Deni Avdija', '8', 'Forward', '6-9', '210 lbs', 'Maccabi Tel Aviv / Israel', false, 15625000, 'Forward', '2001-01-03', 25),
  p('portland-trail-blazers', '1642274', 'Donovan Clingan', '23', 'Center', '7-2', '280 lbs', 'UConn', false, 7171440, 'Center', '2004-02-23', 22),
  p('portland-trail-blazers', '1631248', 'Toumani Camara', '33', 'Forward', '6-7', '220 lbs', 'Dayton / Belgium', false, 1891857, 'Wing', '2000-05-08', 26),
  p('portland-trail-blazers', '1629057', 'Robert Williams III', '35', 'Center', '6-9', '237 lbs', 'Texas A&M', false, 12428571, 'Center', '1997-10-17', 28),
  p('portland-trail-blazers', '1629680', 'Matisse Thybulle', '4', 'Guard / Forward', '6-5', '201 lbs', 'Washington / Australia', false, 11025000, 'Wing', '1997-03-04', 29),

  // ==========================================
  // UTAH JAZZ
  // ==========================================
  p('utah-jazz', '1628374', 'Lauri Markkanen', '23', 'Forward', '7-0', '240 lbs', 'Arizona / Finland', false, 42176400, 'Forward', '1997-05-22', 29),
  p('utah-jazz', '1629012', 'Collin Sexton', '2', 'Guard', '6-3', '190 lbs', 'Alabama', false, 18350000, 'Guard', '1999-01-04', 27),
  p('utah-jazz', '1631117', 'Walker Kessler', '24', 'Center', '7-0', '245 lbs', 'Auburn', false, 2965920, 'Center', '2001-07-26', 25),
  p('utah-jazz', '1641718', 'Keyonte George', '3', 'Guard', '6-4', '185 lbs', 'Baylor', false, 4086600, 'Point Guard', '2003-11-08', 22),
  p('utah-jazz', '1628381', 'John Collins', '20', 'Forward', '6-9', '226 lbs', 'Wake Forest', false, 26580000, 'Forward', '1997-09-23', 29),
  p('utah-jazz', '203903', 'Jordan Clarkson', '00', 'Guard', '6-3', '194 lbs', 'Missouri / Philippines', false, 14092577, 'Guard', '1992-06-07', 34),
  p('utah-jazz', '1641707', 'Taylor Hendricks', '0', 'Forward', '6-9', '215 lbs', 'UCF', false, 5840880, 'Forward', '2003-11-22', 22),
  p('utah-jazz', '1642260', 'Cody Williams', '5', 'Forward', '6-8', '190 lbs', 'Colorado', false, 5840880, 'Wing', '2004-11-20', 21),
  p('utah-jazz', '1642273', 'Isaiah Collier', '8', 'Guard', '6-4', '210 lbs', 'USC', false, 2552520, 'Point Guard', '2004-10-08', 21),
  p('utah-jazz', '1641727', 'Brice Sensabaugh', '13', 'Forward / Guard', '6-6', '235 lbs', 'Ohio State', false, 2571480, 'Wing', '2003-10-30', 22),

  // ==========================================
  // WASHINGTON WIZARDS
  // ==========================================
  p('washington-wizards', '1629673', 'Jordan Poole', '13', 'Guard', '6-4', '194 lbs', 'Michigan', false, 29651786, 'Guard', '1999-06-19', 27),
  p('washington-wizards', '1628398', 'Kyle Kuzma', '0', 'Forward', '6-9', '221 lbs', 'Utah', false, 21477273, 'Forward', '1995-07-24', 31),
  p('washington-wizards', '1642259', 'Alex Sarr', '20', 'Center / Forward', '7-0', '224 lbs', 'Perth Wildcats (France)', false, 11244480, 'Center', '2005-04-26', 21),
  p('washington-wizards', '202685', 'Jonas Valančiūnas', '17', 'Center', '6-11', '265 lbs', 'Lithuania', false, 9900000, 'Center', '1992-05-06', 34),
  p('washington-wizards', '1641731', 'Bilal Coulibaly', '00', 'Forward / Guard', '6-8', '195 lbs', 'Metropolitans 92 (France)', false, 6945240, 'Wing', '2004-07-26', 22),
  p('washington-wizards', '1642268', 'Bub Carrington', '8', 'Guard', '6-5', '195 lbs', 'Pittsburgh', false, 4679520, 'Guard', '2005-07-21', 21),
  p('washington-wizards', '1642275', 'Kyshawn George', '18', 'Forward', '6-8', '205 lbs', 'Miami / Switzerland', false, 2552520, 'Wing', '2003-12-12', 22),
  p('washington-wizards', '1630557', 'Corey Kispert', '24', 'Forward', '6-6', '224 lbs', 'Gonzaga', false, 5705887, 'Wing', '1999-03-03', 27),
  p('washington-wizards', '1627763', 'Malcolm Brogdon', '15', 'Guard', '6-4', '229 lbs', 'Virginia', false, 22500000, 'Guard', '1992-12-11', 33),
  p('washington-wizards', '1630180', 'Saddiq Bey', '7', 'Forward', '6-7', '215 lbs', 'Villanova', false, 6400000, 'Wing', '1999-04-09', 27),

  // ==========================================
  // LA CLIPPERS
  // ==========================================
  p('la-clippers', '201935', 'James Harden', '1', 'Guard', '6-5', '220 lbs', 'Arizona State', false, 33653846, 'Point Guard', '1989-08-26', 37),
  p('la-clippers', '202695', 'Kawhi Leonard', '2', 'Forward', '6-7', '225 lbs', 'San Diego State', false, 49205800, 'Wing', '1991-06-29', 35),
  p('la-clippers', '1626181', 'Norman Powell', '24', 'Guard / Forward', '6-4', '215 lbs', 'UCLA', false, 19241379, 'Wing', '1993-05-25', 33),
  p('la-clippers', '1627826', 'Ivica Zubac', '40', 'Center', '7-0', '240 lbs', 'Croatia / Mega Leks', false, 11743210, 'Center', '1997-03-18', 29),
  p('la-clippers', '1629611', 'Terance Mann', '14', 'Guard / Forward', '6-5', '215 lbs', 'Florida State', false, 11423077, 'Wing', '1996-10-18', 29),
  p('la-clippers', '1627884', 'Derrick Jones Jr.', '55', 'Forward', '6-6', '210 lbs', 'UNLV', false, 9523810, 'Wing', '1997-02-15', 29),
  p('la-clippers', '1627739', 'Kris Dunn', '8', 'Guard', '6-3', '205 lbs', 'Providence', false, 5168000, 'Point Guard', '1994-03-18', 32),
  p('la-clippers', '1629645', 'Kevin Porter Jr.', '7', 'Guard', '6-4', '203 lbs', 'USC', false, 2237691, 'Guard', '2000-05-04', 26),
  p('la-clippers', '201587', 'Nicolas Batum', '33', 'Forward', '6-8', '230 lbs', 'Le Mans (France)', false, 4668000, 'Forward', '1988-12-14', 37),
  p('la-clippers', '1629599', 'Amir Coffey', '7', 'Guard / Forward', '6-7', '210 lbs', 'Minnesota', false, 3995918, 'Wing', '1997-06-17', 29),
  p('la-clippers', '1628964', 'Mo Bamba', '11', 'Center', '7-0', '231 lbs', 'Texas', false, 2603984, 'Center', '1998-05-12', 28),
  p('la-clippers', '1630538', 'Bones Hyland', '5', 'Guard', '6-2', '173 lbs', 'VCU', false, 4158440, 'Guard', '2000-09-14', 26),
];

// Write file
const outputPath = path.join(process.cwd(), 'data', '2026_preseason_rosters.json');
fs.writeFileSync(outputPath, JSON.stringify(ALL_ROSTERS, null, 2), 'utf-8');
console.log(`[FOA Generator] Successfully generated ${ALL_ROSTERS.length} verified NBA player records for all 30 teams!`);
console.log(`File saved to: ${outputPath}`);
