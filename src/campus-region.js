const groups={
 Northeast:'ME NH VT MA RI CT NY',
 'Mid-Atlantic':'NJ PA DE MD DC VA WV',
 Southeast:'NC SC GA FL AL MS TN KY',
 Midwest:'OH MI IN IL WI MN IA MO ND SD NE KS',
 Southwest:'TX OK AR LA NM AZ',
 West:'CO UT WY MT ID NV CA OR WA AK HI'
};
const byState=new Map(Object.entries(groups).flatMap(([region,codes])=>codes.split(' ').map(code=>[code,region])));
export const campusRegions=Object.keys(groups);
export function campusRegion(state){return byState.get(String(state||'').trim().toUpperCase())||null}
