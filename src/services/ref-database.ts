
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import * as cheerio from 'cheerio';
import { default as axios } from 'axios';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';
import { PresenceService } from './presence';
import { LoggerService } from './logger';

import * as TurndownService from 'turndown';

const turndownService = new TurndownService({});

interface IDMRefEntry {
  name: string;
  description: string;
  link: string;
  path: string;
  examples?: string[];
  extraCategories?: Array<{ name: string, text: string }>;
}

const BASE_URL = 'http://www.byond.com/docs/ref';

@Singleton
@AutoWired
export class RefDatabaseService extends BaseService {

  @Inject private logger: LoggerService;
  @Inject private presence: PresenceService;

  private refSet: FuzzySetContainer<IDMRefEntry>;

  public async init(client) {
    super.init(client);

    this.reloadRef();
  }

  public async reloadRef() {
    this.refSet = new FuzzySetContainer<IDMRefEntry>({ key: 'name' });

    this.presence.setPresence('the loading game');
    this.logger.log('Loading all ref entries.');

    const listRes = await axios.get(`${BASE_URL}/contents.html`);
    const refRes = await axios.get(`${BASE_URL}/info.html`);

    const $list = cheerio.load(listRes.data);
    const $ref = cheerio.load(refRes.data.split('xmp').join('code')); // fuck the xmp element, it makes this take at least 30x longer when loading

    $list('dt a').each((i, e) => {
      const node = $list(e);
      const href = node.attr('href');
      const link = BASE_URL + '/' + href;
      const name = node.text();
      const path = link.split('#')[1];

      const refNode = $ref(`a[name="${path}"]`);

      const description = refNode.nextUntil('hr', 'p,ol').map((i, el) => {
        return turndownService.turndown($ref(el).html());
      }).get().join('\n\n');

      const examples = refNode.nextUntil('hr', 'code').map((i, el) => {
        return `\`\`\`${$ref(el).text()}\`\`\``;  // ya ever just?
      }).get();

      const extraCategories = refNode.nextUntil('hr', 'dl').map((i, el) => {
        const catName = $ref(el).children('dt').first().text().split('\n').join('').split(':').join('');
        const text = $ref(el).children('dd').first().text().split('\n').join('');

        if (!catName) { return; }

        return { name: catName, text };
      }).get().filter(Boolean);

      const entry: IDMRefEntry = {
        name,
        description,
        link,
        path,
        examples,
        extraCategories
      };

      const hrefEntry: IDMRefEntry = {
        name: path,
        description,
        link,
        path,
        examples,
        extraCategories
      };

      this.refSet.add(entry);
      this.refSet.add(hrefEntry);
    });

    this.presence.setPresence('with your reference');
    this.logger.log('Loaded all ref entries.');
  }

  public searchRef(query: string): IDMRefEntry {
    try {
      return this.refSet.getFirst(query);
    } catch (e) {
      return null;
    }
  }

}
