-- ==============================================================================
-- FRONT OFFICE ATLAS - SEED 30 NBA TEAMS
-- Migration: 002_seed_nba_teams.sql
-- ==============================================================================

-- 1. Insert G League Affiliates First (referenced by parent teams)
INSERT INTO affiliates (slug, name, city, abbreviation, is_independent, arena, verification_status)
VALUES 
    ('rgv-vipers', 'Rio Grande Valley Vipers', 'Edinburg, TX', 'RGV', false, 'Bert Ogden Arena', 'VERIFIED_CURRENT'),
    ('maine-celtics', 'Maine Celtics', 'Portland, ME', 'MNE', false, 'Portland Expo Building', 'VERIFIED_CURRENT'),
    ('long-island-nets', 'Long Island Nets', 'Uniondale, NY', 'LIN', false, 'Nassau Coliseum', 'VERIFIED_CURRENT'),
    ('westchester-knicks', 'Westchester Knicks', 'White Plains, NY', 'WES', false, 'Westchester County Center', 'VERIFIED_CURRENT'),
    ('delaware-blue-coats', 'Delaware Blue Coats', 'Wilmington, DE', 'DEL', false, 'Chase Fieldhouse', 'VERIFIED_CURRENT'),
    ('raptors-905', 'Raptors 905', 'Mississauga, ON', 'RAP', false, 'Paramount Fine Foods Centre', 'VERIFIED_CURRENT'),
    ('windy-city-bulls', 'Windy City Bulls', 'Hoffman Estates, IL', 'WCB', false, 'NOW Arena', 'VERIFIED_CURRENT'),
    ('cleveland-charge', 'Cleveland Charge', 'Cleveland, OH', 'CLE', false, 'Public Auditorium', 'VERIFIED_CURRENT'),
    ('motor-city-cruise', 'Motor City Cruise', 'Detroit, MI', 'MCC', false, 'Wayne State Fieldhouse', 'VERIFIED_CURRENT'),
    ('indiana-mad-ants', 'Indiana Mad Ants', 'Indianapolis, IN', 'MAD', false, 'Gainbridge Fieldhouse', 'VERIFIED_CURRENT'),
    ('wisconsin-herd', 'Wisconsin Herd', 'Oshkosh, WI', 'HER', false, 'Oshkosh Arena', 'VERIFIED_CURRENT'),
    ('college-park-skyhawks', 'College Park Skyhawks', 'College Park, GA', 'CPK', false, 'Gateway Center Arena', 'VERIFIED_CURRENT'),
    ('greensboro-swarm', 'Greensboro Swarm', 'Greensboro, NC', 'GRN', false, 'Novant Health Fieldhouse', 'VERIFIED_CURRENT'),
    ('sioux-falls-skyforce', 'Sioux Falls Skyforce', 'Sioux Falls, SD', 'SXF', false, 'Sanford Pentagon', 'VERIFIED_CURRENT'),
    ('osceola-magic', 'Osceola Magic', 'Kissimmee, FL', 'OSC', false, 'Silver Spurs Arena', 'VERIFIED_CURRENT'),
    ('capital-city-go-go', 'Capital City Go-Go', 'Washington, DC', 'CCG', false, 'Entertainment & Sports Arena', 'VERIFIED_CURRENT'),
    ('grand-rapids-gold', 'Grand Rapids Gold', 'Grand Rapids, MI', 'GRG', false, 'Van Andel Arena', 'VERIFIED_CURRENT'),
    ('iowa-wolves', 'Iowa Wolves', 'Des Moines, IA', 'IAW', false, 'Wells Fargo Arena', 'VERIFIED_CURRENT'),
    ('oklahoma-city-blue', 'Oklahoma City Blue', 'Oklahoma City, OK', 'OKB', false, 'Paycom Center', 'VERIFIED_CURRENT'),
    ('rip-city-remix', 'Rip City Remix', 'Portland, OR', 'RCR', false, 'Chiles Center', 'VERIFIED_CURRENT'),
    ('salt-lake-city-stars', 'Salt Lake City Stars', 'Salt Lake City, UT', 'SLC', false, 'Maverik Center', 'VERIFIED_CURRENT'),
    ('santa-cruz-warriors', 'Santa Cruz Warriors', 'Santa Cruz, CA', 'SCW', false, 'Kaiser Permanente Arena', 'VERIFIED_CURRENT'),
    ('san-diego-clippers', 'San Diego Clippers', 'Oceanside, CA', 'SDC', false, 'Frontwave Arena', 'VERIFIED_CURRENT'),
    ('south-bay-lakers', 'South Bay Lakers', 'El Segundo, CA', 'SBL', false, 'UCLA Health Training Center', 'VERIFIED_CURRENT'),
    ('valley-suns', 'Valley Suns', 'Tempe, AZ', 'VSU', false, 'Mullett Arena', 'VERIFIED_CURRENT'),
    ('stockton-kings', 'Stockton Kings', 'Stockton, CA', 'STK', false, 'Adventist Health Arena', 'VERIFIED_CURRENT'),
    ('texas-legends', 'Texas Legends', 'Frisco, TX', 'TEX', false, 'Comerica Center', 'VERIFIED_CURRENT'),
    ('memphis-hustle', 'Memphis Hustle', 'Southaven, MS', 'MHU', false, 'Landers Center', 'VERIFIED_CURRENT'),
    ('birmingham-squadron', 'Birmingham Squadron', 'Birmingham, AL', 'BIR', false, 'Legacy Arena', 'VERIFIED_CURRENT'),
    ('austin-spurs', 'Austin Spurs', 'Cedar Park, TX', 'AUS', false, 'H-E-B Center', 'VERIFIED_CURRENT'),
    ('mexico-city-capitanes', 'Capitanes de Ciudad de México', 'Mexico City, Mexico', 'CAP', true, 'Arena CDMX', 'VERIFIED_CURRENT')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    abbreviation = EXCLUDED.abbreviation,
    is_independent = EXCLUDED.is_independent,
    arena = EXCLUDED.arena;

-- 2. Insert the 30 NBA Franchises
INSERT INTO teams (slug, nba_team_id, name, city, nickname, abbreviation, conference, division, primary_color, secondary_color, accent_color, dark_surface, arena, affiliate_name, season, roster_phase, verification_status)
VALUES
    -- Eastern Conference - Atlantic
    ('boston-celtics', '1610612738', 'Boston Celtics', 'Boston', 'Celtics', 'BOS', 'Eastern', 'Atlantic', '#007A33', '#BA9653', '#007A33', '#0b160f', 'TD Garden', 'Maine Celtics', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('brooklyn-nets', '1610612751', 'Brooklyn Nets', 'Brooklyn', 'Nets', 'BKN', 'Eastern', 'Atlantic', '#000000', '#FFFFFF', '#707070', '#121214', 'Barclays Center', 'Long Island Nets', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('new-york-knicks', '1610612752', 'New York Knicks', 'New York', 'Knicks', 'NYK', 'Eastern', 'Atlantic', '#006BB6', '#F58426', '#006BB6', '#0d1723', 'Madison Square Garden', 'Westchester Knicks', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('philadelphia-76ers', '1610612755', 'Philadelphia 76ers', 'Philadelphia', '76ers', 'PHI', 'Eastern', 'Atlantic', '#006BB6', '#ED174C', '#ED174C', '#181119', 'Wells Fargo Center', 'Delaware Blue Coats', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('toronto-raptors', '1610612761', 'Toronto Raptors', 'Toronto', 'Raptors', 'TOR', 'Eastern', 'Atlantic', '#CE1141', '#000000', '#CE1141', '#1c0c11', 'Scotiabank Arena', 'Raptors 905', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),

    -- Eastern Conference - Central
    ('chicago-bulls', '1610612741', 'Chicago Bulls', 'Chicago', 'Bulls', 'CHI', 'Eastern', 'Central', '#CE1141', '#000000', '#CE1141', '#1e0c10', 'United Center', 'Windy City Bulls', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('cleveland-cavaliers', '1610612739', 'Cleveland Cavaliers', 'Cleveland', 'Cavaliers', 'CLE', 'Eastern', 'Central', '#860038', '#041E42', '#FDBB30', '#190a10', 'Rocket Mortgage FieldHouse', 'Cleveland Charge', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('detroit-pistons', '1610612765', 'Detroit Pistons', 'Detroit', 'Pistons', 'DET', 'Eastern', 'Central', '#1D42BA', '#C8102E', '#1D42BA', '#0c1221', 'Little Caesars Arena', 'Motor City Cruise', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('indiana-pacers', '1610612754', 'Indiana Pacers', 'Indiana', 'Pacers', 'IND', 'Eastern', 'Central', '#002D62', '#FDBB30', '#FDBB30', '#0d1522', 'Gainbridge Fieldhouse', 'Indiana Mad Ants', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('milwaukee-bucks', '1610612749', 'Milwaukee Bucks', 'Milwaukee', 'Bucks', 'MIL', 'Eastern', 'Central', '#00471B', '#EEE1C6', '#00471B', '#09150d', 'Fiserv Forum', 'Wisconsin Herd', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),

    -- Eastern Conference - Southeast
    ('atlanta-hawks', '1610612737', 'Atlanta Hawks', 'Atlanta', 'Hawks', 'ATL', 'Eastern', 'Southeast', '#C8102E', '#FDB927', '#C8102E', '#1b0c0f', 'State Farm Arena', 'College Park Skyhawks', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('charlotte-hornets', '1610612766', 'Charlotte Hornets', 'Charlotte', 'Hornets', 'CHA', 'Eastern', 'Southeast', '#1D1160', '#00788C', '#00788C', '#0e1220', 'Spectrum Center', 'Greensboro Swarm', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('miami-heat', '1610612748', 'Miami Heat', 'Miami', 'Heat', 'MIA', 'Eastern', 'Southeast', '#98002E', '#F9A01B', '#98002E', '#170a0e', 'Kaseya Center', 'Sioux Falls Skyforce', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('orlando-magic', '1610612753', 'Orlando Magic', 'Orlando', 'Magic', 'ORL', 'Eastern', 'Southeast', '#0077C0', '#C4CED4', '#0077C0', '#0c1724', 'Kia Center', 'Osceola Magic', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('washington-wizards', '1610612764', 'Washington Wizards', 'Washington', 'Wizards', 'WAS', 'Eastern', 'Southeast', '#002B5C', '#E31837', '#E31837', '#0d1320', 'Capital One Arena', 'Capital City Go-Go', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),

    -- Western Conference - Northwest
    ('denver-nuggets', '1610612743', 'Denver Nuggets', 'Denver', 'Nuggets', 'DEN', 'Western', 'Northwest', '#0E2240', '#FEC524', '#8B2131', '#0d1522', 'Ball Arena', 'Grand Rapids Gold', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('minnesota-timberwolves', '1610612750', 'Minnesota Timberwolves', 'Minnesota', 'Timberwolves', 'MIN', 'Western', 'Northwest', '#0C2340', '#236192', '#78BE20', '#0c1624', 'Target Center', 'Iowa Wolves', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('oklahoma-city-thunder', '1610612760', 'Oklahoma City Thunder', 'Oklahoma City', 'Thunder', 'OKC', 'Western', 'Northwest', '#007AC1', '#EF3B24', '#007AC1', '#0c1724', 'Paycom Center', 'Oklahoma City Blue', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('portland-trail-blazers', '1610612757', 'Portland Trail Blazers', 'Portland', 'Trail Blazers', 'POR', 'Western', 'Northwest', '#E03A3E', '#000000', '#E03A3E', '#190a0c', 'Moda Center', 'Rip City Remix', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('utah-jazz', '1610612762', 'Utah Jazz', 'Utah', 'Jazz', 'UTA', 'Western', 'Northwest', '#002B5C', '#F9A01B', '#002B5C', '#0d1320', 'Delta Center', 'Salt Lake City Stars', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),

    -- Western Conference - Pacific
    ('golden-state-warriors', '1610612744', 'Golden State Warriors', 'Golden State', 'Warriors', 'GSW', 'Western', 'Pacific', '#1D428A', '#FFC72C', '#FFC72C', '#0d1627', 'Chase Center', 'Santa Cruz Warriors', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('la-clippers', '1610612746', 'LA Clippers', 'LA', 'Clippers', 'LAC', 'Western', 'Pacific', '#1D428A', '#C8102E', '#C8102E', '#0e1424', 'Intuit Dome', 'San Diego Clippers', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('los-angeles-lakers', '1610612747', 'Los Angeles Lakers', 'Los Angeles', 'Lakers', 'LAL', 'Western', 'Pacific', '#552583', '#FDB927', '#FDB927', '#160c20', 'Crypto.com Arena', 'South Bay Lakers', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('phoenix-suns', '1610612756', 'Phoenix Suns', 'Phoenix', 'Suns', 'PHX', 'Western', 'Pacific', '#1D1160', '#E56020', '#E56020', '#130d22', 'Footprint Center', 'Valley Suns', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('sacramento-kings', '1610612758', 'Sacramento Kings', 'Sacramento', 'Kings', 'SAC', 'Western', 'Pacific', '#5A2D81', '#63727A', '#5A2D81', '#150d1e', 'Golden 1 Center', 'Stockton Kings', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),

    -- Western Conference - Southwest
    ('dallas-mavericks', '1610612742', 'Dallas Mavericks', 'Dallas', 'Mavericks', 'DAL', 'Western', 'Southwest', '#00538C', '#002B5E', '#00538C', '#0c1524', 'American Airlines Center', 'Texas Legends', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('houston-rockets', '1610612745', 'Houston Rockets', 'Houston', 'Rockets', 'HOU', 'Western', 'Southwest', '#CE1141', '#000000', '#CE1141', '#1c0c10', 'Toyota Center', 'Rio Grande Valley Vipers', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('memphis-grizzlies', '1610612763', 'Memphis Grizzlies', 'Memphis', 'Grizzlies', 'MEM', 'Western', 'Southwest', '#5D76A9', '#12173F', '#5D76A9', '#0f1422', 'FedExForum', 'Memphis Hustle', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('new-orleans-pelicans', '1610612740', 'New Orleans Pelicans', 'New Orleans', 'Pelicans', 'NOP', 'Western', 'Southwest', '#0C2340', '#C8102E', '#85714D', '#0d1320', 'Smoothie King Center', 'Birmingham Squadron', '2026-27', 'training_camp', 'VERIFIED_CURRENT'),
    ('san-antonio-spurs', '1610612759', 'San Antonio Spurs', 'San Antonio', 'Spurs', 'SAS', 'Western', 'Southwest', '#C4CED4', '#000000', '#8A97A0', '#121417', 'Frost Bank Center', 'Austin Spurs', '2026-27', 'training_camp', 'VERIFIED_CURRENT')
ON CONFLICT (slug) DO UPDATE SET
    nba_team_id = EXCLUDED.nba_team_id,
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    nickname = EXCLUDED.nickname,
    abbreviation = EXCLUDED.abbreviation,
    conference = EXCLUDED.conference,
    division = EXCLUDED.division,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    accent_color = EXCLUDED.accent_color,
    dark_surface = EXCLUDED.dark_surface,
    arena = EXCLUDED.arena,
    affiliate_name = EXCLUDED.affiliate_name,
    verification_status = EXCLUDED.verification_status;

-- 3. Link Affiliates to Parent Teams
UPDATE affiliates a
SET parent_team_id = t.id, parent_team_name = t.name
FROM teams t
WHERE 
    (a.slug = 'rgv-vipers' AND t.slug = 'houston-rockets') OR
    (a.slug = 'maine-celtics' AND t.slug = 'boston-celtics') OR
    (a.slug = 'long-island-nets' AND t.slug = 'brooklyn-nets') OR
    (a.slug = 'westchester-knicks' AND t.slug = 'new-york-knicks') OR
    (a.slug = 'delaware-blue-coats' AND t.slug = 'philadelphia-76ers') OR
    (a.slug = 'raptors-905' AND t.slug = 'toronto-raptors') OR
    (a.slug = 'windy-city-bulls' AND t.slug = 'chicago-bulls') OR
    (a.slug = 'cleveland-charge' AND t.slug = 'cleveland-cavaliers') OR
    (a.slug = 'motor-city-cruise' AND t.slug = 'detroit-pistons') OR
    (a.slug = 'indiana-mad-ants' AND t.slug = 'indiana-pacers') OR
    (a.slug = 'wisconsin-herd' AND t.slug = 'milwaukee-bucks') OR
    (a.slug = 'college-park-skyhawks' AND t.slug = 'atlanta-hawks') OR
    (a.slug = 'greensboro-swarm' AND t.slug = 'charlotte-hornets') OR
    (a.slug = 'sioux-falls-skyforce' AND t.slug = 'miami-heat') OR
    (a.slug = 'osceola-magic' AND t.slug = 'orlando-magic') OR
    (a.slug = 'capital-city-go-go' AND t.slug = 'washington-wizards') OR
    (a.slug = 'grand-rapids-gold' AND t.slug = 'denver-nuggets') OR
    (a.slug = 'iowa-wolves' AND t.slug = 'minnesota-timberwolves') OR
    (a.slug = 'oklahoma-city-blue' AND t.slug = 'oklahoma-city-thunder') OR
    (a.slug = 'rip-city-remix' AND t.slug = 'portland-trail-blazers') OR
    (a.slug = 'salt-lake-city-stars' AND t.slug = 'utah-jazz') OR
    (a.slug = 'santa-cruz-warriors' AND t.slug = 'golden-state-warriors') OR
    (a.slug = 'san-diego-clippers' AND t.slug = 'la-clippers') OR
    (a.slug = 'south-bay-lakers' AND t.slug = 'los-angeles-lakers') OR
    (a.slug = 'valley-suns' AND t.slug = 'phoenix-suns') OR
    (a.slug = 'stockton-kings' AND t.slug = 'sacramento-kings') OR
    (a.slug = 'texas-legends' AND t.slug = 'dallas-mavericks') OR
    (a.slug = 'memphis-hustle' AND t.slug = 'memphis-grizzlies') OR
    (a.slug = 'birmingham-squadron' AND t.slug = 'new-orleans-pelicans') OR
    (a.slug = 'austin-spurs' AND t.slug = 'san-antonio-spurs');

-- 4. Update teams table with affiliate_id foreign key
UPDATE teams t
SET affiliate_id = a.id
FROM affiliates a
WHERE a.parent_team_id = t.id;
