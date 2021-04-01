/////// CONSTANTS ///////////
const PSE_VALUES = {
  "[O-HEI1] HEI institutional capacity to manage, support, and conduct high quality development-relevant research has increased": 0,
  "[O-HEI2] Capacity of researchers to conduct high quality development-relevant research has increased": 1,
  "[O-HEI3] Capacity of researchers and/or institutions to translate research into (use) practice, program, and policy": 2,
  "[O-HEI4] HEI research networks expanded to identify and solve development challenges": 3,
  "[O-PDO1] Linkage between research networks and policy/ development community has improved": 4,
  "[O-PDO2] Linkages between research networks and private sector community increased": 5,
  "[O-PDO3] Capacity of development actors to integrate evidence in programming increased": 6,
  "[O-PDO4] Commitment of development actors to integrate evidence in programming increased": 7,
  "[O-RU1] Translation of research into programs and practice has increased": 8,
  "[O-RU2] Translation of research into policy has increased": 9
};

const PSE_UNITAID_VALUES = {
  "Strong In-Country Networks and Relationships": 5,
  "Support to Strengthen Enabling Environments": 6,
  "Sectoral Expertise and Knowledge": 7,
  "Risk-Mitigation and Flexible Authorities": 8,
  "Reputation and Credible Convening Power": 9,
};

const WAYS_WE_ENGAGE = {
  "BRC1 - Between development organizations and scientific, research, and academic institutions, both domestic and international": 0,
  "BRC2 - Between individual researchers, both domestic and international": 1,
  "BRC3 - Between individual policymakers/practitioners and researchers": 2,
  "BRC4 - Between scientific, research, and academic institutions, both domestic and international": 3,
  "BRC5 - In partnership with community-level actors": 4,
  "CB-HEI1 - In project management and research administration": 5,
  "CB-HEI2 - In curriculum development, pedagogy, or other teaching and trainings skills": 6,
  "CB-RE1 - In conceptualization and design of policy- and social impact-relevant research": 7,
  "CB-RE2 - Through research translation training (also with HEIs)": 8,
  "CB-RE3 - Through specialized research implementation and translation technical assistance": 9,
  "CB-RE4 - Through creation of centers of excellence": 10,
  "CB-RE5 - On use of advanced digital tools": 11,
  "CB-PP1 - On data literacy and use": 12,
  "CB-PP2 - On partnering with researchers": 13,
  "CB-PP3 - Through specialized technical assistance on research translation and use": 14,
  "RP1 - To individual researchers in the form of monetary support": 15,
  "RP2 - To individual researchers in the form of equipment and other in-kind support": 16,
  "RP3 - To academic, research, and other scientific institutions in the form of monetary support": 17,
  "RP4 - To academic, research, and other scientific institutions in the form of equipment, infrastructure, and other in-kind support": 18,
  "RP5 - For joint funding of domestic and international collaborations": 19,
  "RP6 - For fellowships and exchanges": 20,
  "RP7 - For internship and work-study opportunities": 21,
  "ES1 - For coordinating research across organizations through R&D councils, science academies, and similar entities": 22,
  "ES2 - For HEI-based innovation accelerators and incubators": 23,
  "ES3 - To create and/or strengthen research networks": 24,
  "ES4 - Through HEI -based tech transfer/commercialization programs": 25,
  "ES5 - By facilitating the design, implementation, and management of scientific research-related policies": 26,
  "RD1 - Through face-to-face events": 27,
  "RD2 - Through workshops and problem-solving events": 28,
  "RD3 - On collaborative platforms": 29,
  "RD4 - On websites for disseminating evidence and research findings": 30
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
    filter_categories: Object,
    config: Object
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
    filtered_documents: Array,
    config: Object
  },
  data: function () {
    return {
      filtered_summary: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
  mounted: function () {
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
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], [], []]
      ];
      const vue_object = this;
      filtered_docs.forEach(doc => {
        if (doc["R4D Activities"]) {
          doc["R4D Activities"].forEach(way => {
            if (doc["R4D Outcomes"]) {
              doc["R4D Outcomes"].forEach(key_value => {
                if ((way in WAYS_WE_ENGAGE) && (key_value in PSE_VALUES)) {
                  console.log(new_summary);
                  new_summary[WAYS_WE_ENGAGE[way]][PSE_VALUES[key_value]] += 1;
                  filtered_summary_docs[WAYS_WE_ENGAGE[way]][PSE_VALUES[key_value]].push(doc);
                }
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

const footer = {
  name: 'footer',
  props: {
    config: Object
  },
  template: '#footer',
};

const details = {
  props: {
    documents: Array,
    filter_categories: Object,
    config: Object
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

const faq = {
  template: '#faq-component'
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
      },
    ]  
  },
  { path: '/doc/:id', component: details, name: 'details' },
  {
    path: '/faq',
    component: faq,
    name: 'faq'
  }
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
      filter_categories: {},
      config: {}
    }
  },
  mounted: async function () {
    // this is the ONLY place where all of the documents are fetched now.
    const response = await axios.get('data/latest.json', { responseType: 'json' });
    const configResponse = await axios.get('config.json', { responseType: 'json' });
    this.config = configResponse.data;
    this.documents = response.data.records;
    this.filter_categories = response.data.filteredFields;
    this.loading = false;
    // TODO: Catch any fetch errors
  },
});
