/////// CONSTANTS ///////////
const PSE_VALUES = {
  "Scale, Sustainability, and Reach": 0,
  "Ability to Influence Policy": 1,
  "Innovation, Expertise, and Capabilities": 2,
  "Efficiency and Effectiveness": 3,
  "Flexibility and Pace": 4,
};

const PSE_UNITAID_VALUES = {
  "Strong In-Country Networks and Relationships": 5,
  "Support to Strengthen Enabling Environments": 6,
  "Sectoral Expertise and Knowledge": 7,
  "Risk-Mitigation and Flexible Authorities": 8,
  "Reputation and Credible Convening Power": 9,
};

const WAYS_WE_ENGAGE = {
  "Information-Sharing and Strategic Alignment": 0,
  "Advancing Learning and Market Research;": 1,
  "Harnessing Private-Sector Expertise and Innovation;": 2,
  "Catalyzing Private-Sector Resources;": 3,
  "Strengthening the Enabling Environment": 4,
  "Unlocking Private Investment;": 3
};


/////// GLOBAL REGISTRATIONS 
// used to shorten the internet URL field in the details component.
Vue.filter('truncate', function (value, max_length = 115) {
  if (value && value.length > max_length) {
    return `${value.substring(0, max_length)}...`;
  }
  return value;
});

Vue.component('vue-multiselect', window.VueMultiselect.default)


////// COMPONENTS /////////////
const relevantDocumentsModal = {
  props: {
    isHidden: Boolean,
    state: Object
  },
  computed: {
    doc_types: function () {
      return [...new Set(this.state.relevant_docs.map(doc => doc['Type of Document']))].sort();
    },
    docs_in_categories: function () {
      // categorize each document by its type
      return this.doc_types.reduce((acc, doc_type) => ({ ...acc, [doc_type]: this.state.relevant_docs.filter(doc => doc['Type of Document'] === doc_type) }), {});
    }
  },
  template: '#relevant-docs-modal-component'
};

const matrixCellComponent = {
  props: ['count', 'color_base'],
  template: '#matrix-cell-component'
};

const egm_layout = {
  name: 'egm_layout',
  components: {
    'matrix-cell': matrixCellComponent,
    'relevant-documents': relevantDocumentsModal
  },
  props: {
    documents: Array,
    filter_categories: Object
  },
  data: function () {
    return {
      filters: {
        region: [],
        country: [],
        industry: [],
        enterprise_type: [],
        technical_sector: [],
        resource_type: []
      },
      search: "",
      filtered_documents: [],
    };
  },
  template: '#egm-layout',
  mounted: function () {
    this.filtered_documents = this.documents;
  },
  methods: {
    filter_records: function () {
      const vue_object = this;
      var filtered_docs = this.documents.filter(function (doc) {
        return (
          (vue_object.filters.region.length == 0 || vue_object.multi_select_filter(doc, "USAID Region", 'region')) &&
          (vue_object.filters.country.length == 0 || vue_object.multi_select_filter(doc, "Country(ies)", 'country')) && 
          (vue_object.filters.technical_sector.length == 0 || vue_object.multi_select_filter(doc, "Technical Sector", 'technical_sector')) && 
          (vue_object.filters.enterprise_type.length == 0 || vue_object.multi_select_filter(doc, "Type of Enterprise", 'enterprise_type')) && 
          (vue_object.filters.industry.length == 0 || vue_object.multi_select_filter(doc, "Private Sector Industry", 'industry')) && 
          (vue_object.filters.resource_type.length == 0 || vue_object.multi_select_filter(doc, "Type of Document", 'resource_type')) 
          // (vue_object.filters.region === "" || (doc["USAID Region"] && doc["USAID Region"].includes(vue_object.filters.region))) &&
          // (vue_object.filters.country === "" || (doc["Country(ies)"] && doc["Country(ies)"].includes(vue_object.filters.country))) &&
          // (vue_object.filters.technical_sector === "" || (doc["Technical Sector"] && doc["Technical Sector"].includes(vue_object.filters.technical_sector))) &&
          // (vue_object.filters.enterprise_type === "" || (doc["Type of Enterprise"] && doc["Type of Enterprise"].includes(vue_object.filters.enterprise_type))) &&
          // (vue_object.filters.industry === "" || (doc["Private Sector Industry"] && doc["Private Sector Industry"].includes(vue_object.filters.industry))) &&
          // (vue_object.filters.resource_type === "" || (doc["Type of Document"] && doc["Type of Document"] === vue_object.filters.resource_type))
        )

      });

      var searched_and_filtered_docs;
      if( this.search === "" ) {
        searched_and_filtered_docs = filtered_docs;
      }
      else {
        gtag('event', 'search', { 'search_term' : this.search });
        searched_and_filtered_docs = filtered_docs.filter(function(doc) {
          return (
            vue_object.search_list_field(doc, "USAID Region", vue_object.search ) ||
            vue_object.search_list_field(doc, "Country(ies)", vue_object.search ) ||
            vue_object.search_list_field(doc, "Technical Sector", vue_object.search ) ||
            vue_object.search_list_field(doc, "Type of Enterprise", vue_object.search ) ||
            vue_object.search_list_field(doc, "Private Sector Industry", vue_object.search ) ||
            vue_object.search_list_field(doc, "Author(s)", vue_object.search ) ||
            vue_object.search_list_field(doc, "Name of Private Sector Partner(s)", vue_object.search ) ||
            vue_object.search_list_field(doc, "Publishing Institution(s)", vue_object.search ) ||
            doc["Type of Document"] && doc["Type of Document"].toLowerCase().includes(vue_object.search.toLowerCase()) ||
            doc["Document Title"] && doc["Document Title"].toLowerCase().includes(vue_object.search.toLowerCase()) || 
            doc["Key Findings"] && doc["Key Findings"].toLowerCase().includes(vue_object.search.toLowerCase()) 
          )
        })
      }

      this.filtered_documents = searched_and_filtered_docs
      // return this.filtered_documents;
      // Map reduce the documents somehow here to get a new summary table.
    },
    multi_select_filter: function(document, field, filter_key) {
      var match = false;
      if(document[field] ) {
        this.filters[filter_key].forEach(function(filter_choice){
          if( document[field].includes(filter_choice) ) {
            match = true;
          }
        })
      }
      return match
    },
    search_list_field: function(document, field, search_term) {
      var match = false;
      if(document[field] ) {
        document[field].forEach(function(value) {
          if( match === false && value.toLowerCase().includes(search_term.toLowerCase()) ) { // no need to keep searching if match is already true
            match = true; 
        }
        })
      }
      return match
    },
    filter_change: function () {
      this.filter_records();
    },
    reset_filters: function () {
      for (const [key, value] of Object.entries(this.filters)) {
        this.filters[key] = [];
      }
      this.search = ""
      this.filter_records();
    }
  }
};

const map = {
  name: 'map_page',
  components: {
    'matrix-cell': matrixCellComponent,
    'relevant-documents': relevantDocumentsModal
  },
  props: {
    filtered_documents: Array
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
      documents: [],
      filtered_summary_docs: [],
      docs_modal_state: {
        value_title: '',
        value_text: '',
        way_text: '',
        num_relevant_docs: 0,
        relevant_docs: []
      },
      show_documents_modal: false,
    };
  },
  template: '#map-component',
  mounted: function() {
    this.filter_records(this.filtered_documents)
    $('[data-toggle="popover"]').popover()
    $('[data-toggle="tooltip"]').tooltip()
  },
  watch: {
    // whenever question changes, this function will run
    filtered_documents: function (newDocs, oldDocs) {
      this.filter_records(newDocs)
    }
  },
  methods: {
    filter_records: function (filtered_docs) {
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

      filtered_docs.forEach(doc => {
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
    build_docs_modal: function (options) {
      const values_length = Object.keys(PSE_VALUES).length;
      const offers_length = Object.keys(PSE_UNITAID_VALUES).length;
      this.docs_modal_state.value_title = options.value_index >= values_length ? 'Development Actor Value Proposition' : 'Private Sector Value Proposition';
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

const list = {
  name: 'list_page',
  props: {
    filtered_documents: Array
  },
  computed: {
    doc_types: function () {
      return [...new Set(this.filtered_documents.map(doc => doc['Type of Document']))].sort();
    },
    docs_in_categories: function () {
      // categorize each document by its type
      return this.doc_types.reduce((acc, doc_type) => ({ ...acc, [doc_type]: this.filtered_documents.filter(doc => doc['Type of Document'] === doc_type) }), {});
    }
  },
  template: '#list-component',
};

const details = {
  props: {
    documents: Array,
    filter_categories: Object
  },
  data: function () {
    return {
      error: null,
      document_details: null
    }
  },
  mounted: function () {
    try {
        const doc_id = this.$route.params.id;
        this.document_details = this.documents.find(doc => doc['Document ID'] === doc_id);
        if (!this.document_details) {
          // Show error message if document ID is not found
          this.error = `Unable to find document with ID: ${doc_id}`;
        }
        gtag('event', 'view_item', { 'event_label' : doc_id + ' - ' + this.document_details['Document Title'] });
    } catch (err) {
      this.error = err.toString();
    }
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

////// ROUTER ///////////
const routes = [
  { path: '', redirect: { name: 'egm' }},
  { path: '/egm_layout/', component: egm_layout, name: 'egm_layout',
    children: [
      {
        path: '/egm',
        component: map,
        name: 'egm'
      },
      {
        path: '/list',
        component: list,
        name: 'list'
      }
    ]  
  },
  { path: '/doc/:id', component: details, name: 'details' }
];

const router = new VueRouter({
  routes,
  scrollBehavior (to, from, savedPosition) {
    // Scroll to the top of  the page for details route otherwise
    // used the saved scroll position for other routes
    if (to.name === 'details') {
      return { x: 0, y: 0 };
    } else {
      return savedPosition;
    }
  }
});

////// BASE APP ///////////
const app = new Vue({
  router: router,
  el: '#app',
  data: function () {
    return {
      loading: true,
      error: null,
      documents: [],
      filter_categories: {} 
    }
  },
  mounted: async function () {
    // this is the ONLY place where all of the documents are fetched now.
    const response = await axios.get('data/latest.json', { responseType: 'json' });
    this.documents = response.data.records;
    this.filter_categories = response.data.filteredFields;
    this.loading = false;
    // TODO: Catch any fetch errors
  },
});
