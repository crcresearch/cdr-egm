const PSE_VALUES = {
  "Ability to Influence Policy": 0,
  "Efficiency and Effectiveness": 1,
  "Flexibility and Pace": 2,
  "Innovation, Expertise, and Capabilities": 3,
  "Scale, Sustainability, and Reach": 4
};

const PSE_UNITAID_VALUES = {
  "Reputation and Credible Convening Power": 5,
  "Risk-Mitigation and Flexible Authorities": 6,
  "Sectoral Expertise and Knowledge": 7,
  "Strong In-Country Networks and Relationships": 8,
  "Support to Strengthen Enabling Environments": 9
};

const WAYS_WE_ENGAGE = {
  "Advancing Learning and Market Research;": 0,
  "Catalyzing Private-Sector Resources;": 1,
  "Harnessing Private-Sector Expertise and Innovation;": 2,
  "Information-Sharing and Strategic Alignment": 3,
  "Strengthening the Enabling Environment": 4,
  "Unlocking Private Investment;": 5
};

const relevantDocumentsModal = {
  props: {
    isHidden: Boolean,
    state: Object
  },
  computed: {
    high_confidence_docs: function () {
      return this.state.relevant_docs.filter(doc => doc['Type of Document'] === 'Peer-reviewed article or other research report');
    },
    low_confidence_docs: function () {
      return this.state.relevant_docs.filter(doc => doc['Type of Document'] !== 'Peer-reviewed article or other research report');
    }
  },
  template: '#relevant-docs-modal-component'
};

const matrixCellComponent = {
  props: ['count', 'color_base'],
  template: '#matrix-cell-component'
};

Vue.filter('truncate', function (value, max_length = 115) {
  if (value && value.length > max_length) {
    return `${value.substring(0, max_length)}...`;
  }
  return value;
});

const map = {
  name: 'map',
  components: {
    'matrix-cell': matrixCellComponent,
    'relevant-documents': relevantDocumentsModal
  },
  data: function () {
    return {
      filtered_summary: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      filters: {
        region: '',
        country: '',
        partners: '',
        enterprise_type: '',
        technical_sector: '',
        resource_type: ''
      },
      documents: [],
      filtered_documents: [],
      filtered_summary_docs: [],
      filter_categories: {},
      docs_modal_state: {
        value_title: '',
        value_text: '',
        way_text: '',
        num_relevant_docs: 0,
        relevant_docs: []
      },
      document_detail_id: '',
      show_documents_modal: false
    };
  },
  template: '#map-component',
  mounted: async function () {
    const response = await axios.get('data/latest.json', { responseType: 'json' });
    this.documents = response.data.records;
    this.filtered_documents = this.documents;
    this.filtered_summary = this.filter_records();
    this.filter_categories = response.data.filteredFields;
  },
  computed: {
    document_details: function () {
      if(this.document_detail_id === '') {
        return {};
      } else {
        return this.documents.find(doc => doc['Document ID'] === this.document_detail_id);
      }
    },
  },
  methods: {
    filter_records: function () {
      const new_summary = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      const filtered_summary_docs = [
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []]
      ];
      const vue_object = this;
      this.filtered_documents = this.documents.filter(function (doc) {
        return (
          (vue_object.filters.region === "" || (doc["USAID Region"] && doc["USAID Region"].includes(vue_object.filters.region))) &&
          (vue_object.filters.country === "" || (doc["Country(ies)"] && doc["Country(ies)"].includes(vue_object.filters.country))) &&
          (vue_object.filters.technical_sector === "" || (doc["Technical Sector"] && doc["Technical Sector"].includes(vue_object.filters.technical_sector))) &&
          (vue_object.filters.enterprise_type === "" || (doc["Type of Enterprise"] && doc["Type of Enterprise"].includes(vue_object.filters.enterprise_type))) &&
          (vue_object.filters.partners === "" || (doc["Name of Private Sector Partner(s)"] && doc["Name of Private Sector Partner(s)"].includes(vue_object.filters.partners))) &&
          (vue_object.filters.resource_type === "" || (doc["Type of Document"] && doc["Type of Document"] === vue_object.filters.resource_type))
        )
      });

      this.filtered_documents.forEach(doc => {
        if (doc["PSE Ways We Engage"]) {
          doc["PSE Ways We Engage"].forEach(way => {
            if (doc["PSE Key Values"]) {
              doc["PSE Key Values"].forEach(key_value => {
                new_summary[WAYS_WE_ENGAGE[way]][PSE_VALUES[key_value]] += 1;
                filtered_summary_docs[WAYS_WE_ENGAGE[way]][PSE_VALUES[key_value]].push(doc);
              })
            }
            if (doc["PSE Key Values USAID Offers"]) {
              doc["PSE Key Values USAID Offers"].forEach(key_value => {
                new_summary[WAYS_WE_ENGAGE[way]][PSE_UNITAID_VALUES[key_value]] += 1;
                filtered_summary_docs[WAYS_WE_ENGAGE[way]][PSE_UNITAID_VALUES[key_value]].push(doc);
              })
            }
          })
        }

      });
      this.filtered_summary = new_summary;
      this.filtered_summary_docs = filtered_summary_docs;
      return new_summary;
      // Map reduce the documents somehow here to get a new summary table.
    },
    filter_change: function () {
      this.filter_records();
    },
    reset_filters: function () {
      for (const [key, value] of Object.entries(this.filters)) {
        this.filters[key] = '';
      }
      this.filter_records();
    },
    build_docs_modal: function (options) {
      const values_length = Object.keys(PSE_VALUES).length;
      const offers_length = Object.keys(PSE_UNITAID_VALUES).length;
      this.docs_modal_state.value_title = `PSE Key Value${options.value_index >= values_length ? ' USAID Offers' : ''}`;
      if (options.value_index < values_length) {
        this.docs_modal_state.value_text = Object.keys(PSE_VALUES).find(key => PSE_VALUES[key] === options.value_index);
      } else if (options.value_index < values_length + offers_length) {
        this.docs_modal_state.value_text = Object.keys(PSE_UNITAID_VALUES).find(key => PSE_UNITAID_VALUES[key] === options.value_index);
      }
      this.docs_modal_state.way_text = Object.keys(WAYS_WE_ENGAGE).find(key => WAYS_WE_ENGAGE[key] === options.way_index);
      this.docs_modal_state.num_relevant_docs = this.filtered_summary[options.way_index][options.value_index];
      this.docs_modal_state.relevant_docs = this.filtered_summary_docs[options.way_index][options.value_index];
      this.show_documents_modal = true;
    }
  }
};
const details = {
  props: {
    'document_details': Object
  },
  computed: {
    document_findings: function () {
      if (this.document_details['Key Findings']) {
        return this.document_details['Key Findings'].split('\n');
      }
      return [];
    },
    document_recommendations: function () {
      if (this.document_details['Key Recommendations']) {
        return this.document_details['Key Recommendations'].split('\n');
      }
      return [];
    }
  },
  template: '#details-component'
};
const routes = [
  { path: '/', component: map },
  { path: '/doc/:id', component: details, name: 'details', props: true }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

const app = new Vue({
  router: router,
  el: '#app'
});
