import request from 'request';
import Promise from 'bluebird';
import _ from 'lodash';
import fs from 'fs';

const reqPromise = Promise.promisify(request);
const req = (options) => reqPromise({forever: true, ...options});

const defaultOptions = {
  headers: {
    'User-Agent': 'Fulcrum Sync',
    'Accept': 'application/json'
  }
};

// const baseURL = 'http://localhost:3000';
const baseURL = 'https://api.fulcrumapp.com';
// const baseURL = 'https://edge.fulcrumapp.com';

class Client {
  urlForResource(resource) {
    return '' + baseURL + resource;
  }

  optionsForRequest(account, options) {
    const result = _.extend({}, defaultOptions, options);
    result.headers['X-ApiToken'] = account.token;
    return result;
  }

  async authenticate(userName, password) {
    const options = {
      method: 'GET',
      uri: this.urlForResource('/api/v2/users.json'),
      auth: {
        username: userName,
        password: password,
        sendImmediately: true
      },
      headers: defaultOptions.headers
    };

    return new Promise((resolve, reject) => {
      request(options, (err, response, body) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(response);
        }
      });
    });
  }

  async getSync(account) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/_private/sync.json')
    });

    return await req(options);
  }

  async getForms(account) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/forms.json')
    });

    return await req(options);
  }

  async getChoiceLists(account) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/choice_lists.json')
    });

    return await req(options);
  }

  async getClassificationSets(account) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/classification_sets.json')
    });

    return await req(options);
  }

  async getProjects(account) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/projects.json')
    });

    try {
      return await req(options);
    } catch (ex) {
      console.log(ex);
      console.log(ex.code === 'ETIMEDOUT');
      console.log(ex.connect === true);
      throw ex;
    }
  }

  async getPhotos(account, form, page) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/photos.json')
    });

    options.qs = {
      per_page: 1000,
      page: page,
      full: '1'
    };

    if (form) {
      options.qs.form_id = form.id;
    }

    return await req(options);
  }

  async getVideos(account, form, page) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/videos.json')
    });

    options.qs = {
      per_page: 1000,
      page: page,
      full: '1'
    };

    if (form) {
      options.qs.form_id = form.id;
    }

    return await req(options);
  }

  download(url, to) {
    return new Promise((resolve, reject) => {
      const rq = request(url).pipe(fs.createWriteStream(to));
      rq.on('close', resolve);
      rq.on('error', reject);
    });
  }

  async getRecords(account, form, page) {
    const options = this.optionsForRequest(account, {
      // url: this.urlForResource('records/history')
      url: this.urlForResource('/api/v2/records.json')
    });

    options.qs = {
      form_id: form.id,
      per_page: 1000,
      page: page
    };

    return await req(options);
  }

  async getRecordsHistory(account, form, page, lastSync) {
    const options = this.optionsForRequest(account, {
      url: this.urlForResource('/api/v2/records/history.json')
    });

    options.qs = {
      form_id: form.id,
      per_page: 1000,
      page: page,
      updated_since: lastSync ? lastSync.getTime() / 1000 : 0
    };

    return await req(options);
  }
}

const client = new Client();

export default client;
