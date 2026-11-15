"""Create local audit sheets; these are not site assets or publication files."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'src/data/players.json').read_text(encoding='utf-8'))
cache=root.parent/'work/atlas-headshots'
out=root.parent/'work/atlas-contact'
out.mkdir(parents=True,exist_ok=True)
font_path=Path('C:/Windows/Fonts/arial.ttf')
font=ImageFont.truetype(str(font_path),14) if font_path.exists() else ImageFont.load_default()
small=ImageFont.truetype(str(font_path),12) if font_path.exists() else ImageFont.load_default()
for abbr in data['teams']:
    players=[p for p in data['players'] if p['team']==abbr]
    cols=4;cell_w=270;cell_h=235;rows=(len(players)+cols-1)//cols
    sheet=Image.new('RGB',(cols*cell_w,rows*cell_h+42),'#edf4ff')
    draw=ImageDraw.Draw(sheet)
    draw.text((14,12),f'{abbr} — {len(players)} players — roster {data["verifiedAt"][:10]}',font=font,fill='#172746')
    for i,p in enumerate(players):
        x=(i%cols)*cell_w;y=(i//cols)*cell_h+42
        draw.rounded_rectangle((x+4,y+4,x+cell_w-4,y+cell_h-4),radius=12,fill='white',outline='#a9c9e5')
        image_file=cache/f'{p["nbaPlayerId"]}.png'
        if image_file.exists():
            with Image.open(image_file) as im:
                im=im.convert('RGBA');sheet.paste(im,(x+5,y+3),im)
        else:draw.text((x+20,y+75),'NO PHOTO',font=font,fill='#a54b4b')
        draw.text((x+10,y+190),f'{i+1:02d}  {p["name"]}',font=font,fill='#172746')
        draw.text((x+10,y+209),f'#{p["jersey"]}  ID {p["nbaPlayerId"]}',font=small,fill='#617392')
    sheet.save(out/f'{abbr}.jpg',quality=90)
print(out)
