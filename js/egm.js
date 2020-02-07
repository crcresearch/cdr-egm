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

const MAX_TITLE_LENGTH = 70;

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
  filters: {
    truncate: function (value) {
      if (value && value.length > MAX_TITLE_LENGTH) {
        return `${value.substring(0, MAX_TITLE_LENGTH)}...`;
      }
      return value;
    }
  },
  template:
    `<div v-if="!isHidden">
      <transition name="modal">
        <div class="modal-mask">
          <div class="modal modal-wrapper" tabindex="-1">
             <div class="modal-dialog modal-dialog-scrollable">
               <div class="modal-content">
                 <div class="modal-header">
                   <h5 class="modal-title">
                     <span class="badge badge-secondary badge-pill mr-1">{{ state.num_relevant_docs }}</span>
                     Relevant Documents
                   </h5>
                   <button type="button" class="close" @click="$emit('close-docs-modal')">
                     <span>&times;</span>
                   </button>
                 </div>
                 <div class="modal-body p-0">
                   <div class="card-header">
                     <p class="mb-0 text-uppercase font-weight-lighter">
                       {{ state.value_title }}
                     </p>
                     <h5 class="mb-2">
                       {{ state.value_text }}
                     </h5>
                     <p class="mb-0 text-uppercase font-weight-lighter">
                       Way We Engage
                     </p>
                     <h5 class="mb-1">
                       {{ state.way_text.replace(';', '') }}
                     </h5>
                   </div>
                   <div class="card-body">
                     <ul class="list-unstyled">
                       <li>
                         <h5
                           class="d-flex justify-content-between align-items-center text-pulte-green"
                         >
                           HIGH Confidence
                           <span
                             class="badge badge-secondary bg-pulte-green badge-pill"
                             >{{ high_confidence_docs.length }}</span
                           >
                         </h5>
                       </li>
                     </ul>
                     <ul class="list-unstyled" v-for="doc in high_confidence_docs">
                       <li>
                         <span class="text-uppercase">Type:</span> {{ doc['Type of Document'] }}
                       </li>
                       <li>
                         <a href="#">{{ doc['Document Title'] | truncate }}</a>
                       </li>
                     </ul>
                     <ul class="list-unstyled">
                       <li>
                         <h5
                           class="d-flex justify-content-between align-items-center text-gold"
                         >
                           MED/LOW Confidence
                           <span class="badge badge-secondary bg-gold badge-pill"
                             >{{ low_confidence_docs.length }}</span
                           >
                         </h5>
                       </li>
                     </ul>
                     <ul class="list-unstyled" v-for="doc in low_confidence_docs">
                       <li>
                         <span class="text-uppercase">Type:</span> {{ doc['Type of Document'] }}
                       </li>
                       <li>
                         <a href="#">{{ doc['Document Title'] | truncate }}</a>
                       </li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </transition>
    </div>`
};

const matrixCellComponent = {
  props: ['count', 'color_base'],
  template: `<div class="square" v-bind:style="{ background: 'rgba(' + color_base + ',' + count/50 + ')'}">
               <a class="count" v-show="count > 0" @click="$emit('show-docs-modal')">
                 {{count}}
               </a>
             </div>`
};
const app = new Vue({
  el: '#app',
  components: {
    'matrix-cell': matrixCellComponent,
    'relevant-documents': relevantDocumentsModal
  },
  data: {
    filtered_summary: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    filters: {
      region: "",
      country: "",
      partners: "",
      enterprise_type: "",
      technical_sector: "",
      resource_type: ""
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
    show_documents_modal: false
  },
  mounted: async function () {
    const response = await axios.get('data/latest.json', { responseType: 'json' });
    this.documents = response.data.records;
    this.filtered_documents = this.documents;
    this.filtered_summary = this.filter_records();
    this.filter_categories = response.data.filteredFields;
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
      this.docs_modal_state.value_title = `PSE Key Value${ options.value_index >= values_length ? ' USAID Offers' : ''}`;
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
});
