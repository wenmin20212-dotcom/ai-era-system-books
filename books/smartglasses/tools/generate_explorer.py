"""Build only this book's explorer data from SUMMARY and Markdown (stdlib only)."""
import hashlib
import json
import re
import sys
from pathlib import Path

BOOK = Path(__file__).resolve().parents[1]
SRC = BOOK / 'src'

# Book-specific editorial associations, keyed by printed section number.
# Geometry is schematic; these are reading links, not a verified hardware BOM.
ASSOCIATIONS = {
 '0.1':['frame'], '0.2':['frame'], '0.3':['frame','soc'],
 '1.1':['frame','mic','speaker','camera'], '1.2':['mic','speaker','camera'],
 '1.3':['display'], '1.4':['display','imu','camera'], '1.5':['antenna','soc'], '1.6':['frame'],
 '2.1':['frame'], '2.2':['frame'], '2.3':['mic','speaker','camera'],
 '2.4':['display'], '2.5':['soc','imu'], '2.6':['battery','antenna','soc'],
 '3.1':['speaker','mic','antenna'], '3.2':['camera','soc'], '3.3':['speaker','display'],
 '3.4':['mic','soc','speaker'], '3.5':['camera','soc','antenna','display','speaker'],
 '3.6':['display','imu','camera'],
 '4.1':['frame'], '4.2':['display','frame'], '4.3':['speaker','mic'],
 '4.4':['camera'], '4.5':['antenna','soc'], '4.6':['camera','mic'],
 '5.1':['camera','soc','antenna','speaker','battery'], '5.2':['display','camera'],
 '5.3':['mic','soc','speaker'], '5.4':['camera','imu','soc','antenna'],
 '5.5':['battery','soc','frame'], '5.6':['soc','antenna','display'],
 '6.1':['soc','battery','mic'], '6.2':['mic','soc','speaker'],
 '6.3':['imu','camera','soc'], '6.4':['imu','camera','soc','display'],
 '6.5':['battery','soc'], '6.6':['antenna','soc','speaker'],
 '7.1':['display'], '7.2':['mic','speaker','soc'], '7.3':['camera','soc'],
 '7.4':['imu','camera','soc'], '7.5':['soc','antenna','battery'], '7.6':['frame','battery','soc'],
 '8.1':['display','camera'], '8.2':['display'], '8.3':['mic','speaker'],
 '8.4':['mic','camera','soc'], '8.5':['imu','soc'], '8.6':['battery','soc','frame'],
 '9.1':['soc','antenna'], '9.2':['camera','mic','soc'],
 '9.3':['mic','soc','speaker'], '9.4':['camera','mic','soc'],
 '9.5':['frame','soc'], '9.6':['frame','soc','antenna','battery']
}
FOCUS = ['frame','frame','soc','mic','camera','antenna','soc','display','display','soc']

def paragraphs(text):
    # Preserve text as text; no raw HTML or Markdown is rendered as executable content.
    out = []
    for block in re.split(r'\n\s*\n', text):
        if not block.strip() or block.lstrip().startswith(('#','![' ,'<img','<figure','</figure')):
            continue
        block = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', block)
        block = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', block)
        block = re.sub(r'<[^>]+>', '', block)
        block = re.sub(r'[*_`]', '', block).strip()
        if block:
            out.append(block)
    return out

def figures(text, source):
    result = []
    for caption, image in re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', text):
        target = (SRC / source).parent.joinpath(image).resolve()
        href = target.relative_to(SRC.resolve()).as_posix()
        if not target.is_file():
            raise ValueError('Missing book figure: '+href)
        result.append({'href':href, 'caption':caption, 'source':source})
    return result

def generate():
    summary = (SRC / 'SUMMARY.md').read_text()
    chapters = []
    digest = hashlib.sha256(summary.encode())
    for match in re.finditer(r'^(\s*)- \[([^\]]+)\]\(([^)]+)\)', summary, re.M):
        indent, title, source = match.groups()
        chapter_match = re.match(r'ch(\d+)/README\.md$', source)
        if chapter_match:
            index = int(chapter_match[1])
            chapters.append({'id':f'ch{index}', 'title':title, 'source':source,
                             'href':source.replace('README.md','index.html'),
                             'focusComponentId':FOCUS[index], 'sections':[]})
        else:
            if not chapters:
                raise ValueError('Section appeared before chapter')
            section_id = re.match(r'\d+\.\d+', title).group()
            text = (SRC / source).read_text()
            digest.update(source.encode()); digest.update(text.encode())
            chapters[-1]['sections'].append({
                'id':section_id, 'title':title, 'source':source,
                'href':source.removesuffix('.md')+'.html',
                'componentIds':ASSOCIATIONS[section_id], 'figures':figures(text, source),
                'paragraphs':paragraphs(text)
            })
    if len(chapters) != 10 or sum(len(c['sections']) for c in chapters) != 57:
        raise ValueError('Expected preface + nine chapters and 57 sections; review mapping after TOC changes')
    for chapter in chapters:
        chapter['figures'] = [figure for section in chapter['sections'] for figure in section['figures']]
    return {'schemaVersion':1,'bookId':'smartglasses','title':'智能眼镜',
            'sourceName':'GitHub 发布书稿 Markdown', 'sourceSha256':digest.hexdigest(),
            'canonicalBase':'https://books.sagewritepress.com/smartglasses/',
            'representation':'schematic','mappingStatus':'editorial-associations',
            'hardwareVerificationStatus':'not-a-product-teardown','chapters':chapters}

if __name__ == '__main__':
    if 'supports' in sys.argv:
        sys.exit(0 if sys.argv[-1] == 'html' else 1)
    payload = json.load(sys.stdin) if '--mdbook' in sys.argv else None
    target = SRC / 'explorer' / 'book.json'
    target.write_text(json.dumps(generate(),ensure_ascii=False,indent=2)+'\n')
    if payload is not None:
        json.dump(payload[1], sys.stdout, ensure_ascii=False)
    else:
        print('Generated smartglasses explorer: 10 chapters, 57 source-linked sections')
