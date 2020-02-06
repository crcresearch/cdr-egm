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

const matrixCellComponent = {
  props: ["count", "color_base"],
  template: `<div
                      class="square"
                      v-bind:style="{ background: 'rgba(' + color_base + ',' + count/50 + ')'}"
                    >
                    <a
                        class="count"
                        data-toggle="modal"
                        data-target="#exampleModal"
                        v-show="count > 0"
                        >{{count}}</a
                      >
                    </div>`
};
const app = new Vue({
  el: "#app",
  components: {
    "matrix-cell": matrixCellComponent
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
    filter_categories: {}
  },
  mounted: function () {
    axios
      .get('https://raw.githubusercontent.com/crcresearch/usaid-pse-egm/master/data/latest.json')
      .then(response => axios.get(`https://raw.githubusercontent.com/crcresearch/usaid-pse-egm/master/data/${response.data}`))
      .then(response => {
        this.documents = response.data.records;
        this.filtered_documents = this.documents;
        this.filtered_summary = this.filter_records();
        this.filter_categories = response.data.filteredFields;
      });
  },
  // define methods under the `methods` object
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
                new_summary[WAYS_WE_ENGAGE[way]][PSE_VALUES[key_value]] += 1
              })
            }
            if (doc["PSE Key Values USAID Offers"]) {
              doc["PSE Key Values USAID Offers"].forEach(key_value => {
                new_summary[WAYS_WE_ENGAGE[way]][PSE_UNITAID_VALUES[key_value]] += 1
              })
            }
          })
        }

      });
      this.filtered_summary = new_summary;
      return new_summary;
      // Map reduce the documents somehow here to get a new summary table.
    },
    filter_change: function () {
      this.filter_records();
    }
  }
});
