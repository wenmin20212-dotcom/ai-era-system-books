import importlib.util
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

BOOK = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generate', BOOK/'tools/generate_explorer.py')
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)

class ExplorerIntegrationTests(unittest.TestCase):
    def test_generated_dataset_matches_current_markdown(self):
        actual = json.loads((BOOK/'src/explorer/book.json').read_text())
        self.assertEqual(actual, generator.generate())
        self.assertEqual(len(actual['chapters']),10)
        self.assertEqual(sum(len(c['sections']) for c in actual['chapters']),57)

    def test_reading_links_and_component_ids_are_valid(self):
        data=generator.generate()
        definitions=(BOOK/'src/explorer/knowledge.js').read_text()
        component_ids=set(re.findall(r"id:'([^']+)'",definitions))
        ids=[]
        for chapter in data['chapters']:
            self.assertTrue((BOOK/'src'/chapter['source']).is_file())
            self.assertIn(chapter['focusComponentId'],component_ids)
            for section in chapter['sections']:
                ids.append(section['id'])
                self.assertTrue((BOOK/'src'/section['source']).is_file())
                self.assertEqual(section['href'],section['source'].replace('.md','.html'))
                self.assertTrue(section['paragraphs'])
                self.assertTrue(set(section['componentIds']).issubset(component_ids))
        self.assertEqual(len(ids),len(set(ids)))

    def test_every_chapter_retains_its_distinct_book_figure(self):
        data=generator.generate()
        all_images=[]
        for index,chapter in enumerate(data['chapters']):
            self.assertEqual(len(chapter['figures']),1)
            figure=chapter['figures'][0]
            self.assertEqual(figure['href'],f'images/fig-{index:02d}.png')
            self.assertTrue((BOOK/'src'/figure['href']).is_file())
            self.assertTrue(figure['caption'])
            self.assertIn(figure,chapter['sections'][0]['figures'])
            all_images.append(figure['href'])
        self.assertEqual(len(set(all_images)),10)

    def test_display_section_is_explicitly_linked(self):
        section=next(s for c in generator.generate()['chapters'] for s in c['sections'] if s['id']=='2.4')
        self.assertEqual(section['componentIds'],['display'])
        self.assertEqual(section['href'],'ch02/13.html')

    def test_mdbook_protocol_does_not_change_manuscript(self):
        script=str(BOOK/'tools/generate_explorer.py')
        probe=subprocess.run([sys.executable,script,'--mdbook','supports','html'],capture_output=True)
        self.assertEqual(probe.returncode,0)
        original={'sections':[{'Chapter':{'name':'unchanged text'}}]}
        result=subprocess.run([sys.executable,script,'--mdbook'],input=json.dumps([{},original]),text=True,capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(json.loads(result.stdout),original)

    def test_chapter_one_teaching_combinations_keep_capability_boundaries(self):
        config=json.loads((BOOK/'src/explorer/chapter-one-data.json').read_text())
        variants={v['id']:v['capabilities'] for v in config['variants']}
        self.assertFalse(variants['camera']['display'])
        self.assertFalse(variants['camera']['spatial'])
        self.assertTrue(variants['display']['display'])
        self.assertFalse(variants['display']['camera'])
        self.assertFalse(variants['display']['spatial'])
        self.assertTrue(variants['ar']['spatial'])
        self.assertEqual(config['representation'],'teaching-combinations')

    def test_scope_does_not_touch_other_books(self):
        repo=BOOK.parents[1]
        result=subprocess.run(['git','status','--porcelain','-uall','-z'],cwd=repo,text=True,capture_output=True,check=True)
        for line in filter(None,result.stdout.split('\0')):
            self.assertTrue(line[3:].startswith('books/smartglasses/'),line)

if __name__=='__main__':unittest.main()
