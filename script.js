Vue.createApp({
  data() {
    return {
      form: {
        fullName: '',
        dob: '',
        gender: '',
        totalVisitors: 1,
        children: 0,
        accommodation: '',
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      },
      errors: {},
      generalError: '',
      places: [],
      selectedPlaces: [],
      isLoadingPlaces: false,
      placesError: '',
      accommodationOptions: [
        { value: 'none', text: 'No accommodation needed' },
        { value: 'forest', text: 'Forest View Hotel' },
        { value: 'totoro', text: 'Totoro Family Inn' },
        { value: 'witch', text: 'Witch Valley Guesthouse' },
        { value: 'luxury', text: 'Luxury Ghibli Resort' }
      ],
      showSummary: false,
      itineraryHTML: ''
    };
  },
  mounted() {
    this.loadPlaces();
  },
  methods: {
    loadPlaces() {
      let self = this;
      this.isLoadingPlaces = true;
      this.placesError = '';
      
      fetch('ghibli_park.json')
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Failed to load places');
          }
          return response.json();
        })
        .then(function(data) {
          self.places = data;
          self.isLoadingPlaces = false;
        })
        .catch(function(error) {
          self.placesError = 'Could not load the list of places.';
          self.isLoadingPlaces = false;
        });
    },
    
    isSelected(placeId) {
      for (let i = 0; i < this.selectedPlaces.length; i++) {
        if (this.selectedPlaces[i].id === placeId) {
          return true;
        }
      }
      return false;
    },
    
    togglePlace(place) {
      let index = -1;
      for (let i = 0; i < this.selectedPlaces.length; i++) {
        if (this.selectedPlaces[i].id === place.id) {
          index = i;
          break;
        }
      }
      
      if (index === -1) {
        this.selectedPlaces.push(place);
      } else {
        this.selectedPlaces.splice(index, 1);
      }
      
      if (this.errors.selectedPlaces) {
        this.errors.selectedPlaces = '';
      }
    },
    
    clearErrors() {
      this.errors = {};
      this.generalError = '';
    },
    
    closeSummary() {
      this.showSummary = false;
      this.itineraryHTML = '';
    },
    
    validateForm() {
      let isValid = true;
      let newErrors = {};
      // 1. personal Detail
      if (this.form.fullName.trim() === '') {
        newErrors.fullName = 'Full name is required';
        isValid = false;
      }
      if (this.form.dob === '') {
        newErrors.dob = 'Date of birth is required';
        isValid = false;
      }
      if (this.form.gender === '') {
        newErrors.gender = 'Gender is required';
        isValid = false;
      }
      
      // 2. ghibli park selection
      if (this.selectedPlaces.length === 0) {
        newErrors.selectedPlaces = 'Please select at least one place to visit';
        isValid = false;
      }
      
      // 3. visitors 
      if (this.form.totalVisitors === '' || this.form.totalVisitors < 1) {
        newErrors.totalVisitors = 'Total number of visitors must be at least 1';
        isValid = false;
      }
      if (this.form.children === undefined || this.form.children === null || this.form.children < 0) {
        newErrors.children = 'Number of children cannot be negative';
        isValid = false;
      }
      if (this.form.children > this.form.totalVisitors) {
        newErrors.children = 'Number of children cannot exceed total visitors';
        isValid = false;
      }
      
      // 4. accommodation
      if (this.form.accommodation === '') {
        newErrors.accommodation = 'Please select an accommodation option';
        isValid = false;
      }
      
      // 5. payment 
      if (this.form.cardName.trim() === '') {
        newErrors.cardName = 'Name on card is required';
        isValid = false;
      }
      if (this.form.cardNumber.trim() === '') {
        newErrors.cardNumber = 'Card number is required';
        isValid = false;
      }
      if (this.form.expiryDate === '') {
        newErrors.expiryDate = 'Expiration date is required';
        isValid = false;
      }
      if (this.form.cvv.trim() === '') {
        newErrors.cvv = 'CVV is required';
        isValid = false;
      }
      
      this.errors = newErrors;
      return isValid;
    },
    
    generateItinerary() {
      this.clearErrors();
      
      if (!this.validateForm()) {
        this.generalError = 'There are mandatory items pending to be filled. Please complete the required fields.';
        this.showSummary = false;
        return;
      }
      
      this.generalError = '';
      
      let cardNumberClean = '';
      for (let i = 0; i < this.form.cardNumber.length; i++) {
        let ch = this.form.cardNumber.charAt(i);
        if (ch !== ' ' && ch !== '-') {
          cardNumberClean = cardNumberClean + ch;
        }
      }
      
      let cardNumberLast4 = '';
      if (cardNumberClean.length >= 4) {
        cardNumberLast4 = cardNumberClean.substring(cardNumberClean.length - 4);
      } else {
        cardNumberLast4 = cardNumberClean;
      }

      let accommodationText = '';
      for (let i = 0; i < this.accommodationOptions.length; i++) {
        if (this.accommodationOptions[i].value === this.form.accommodation) {
          accommodationText = this.accommodationOptions[i].text;
          break;
        }
      }
      
      let selectedPlacesHTML = '';
      for (let i = 0; i < this.selectedPlaces.length; i++) {
        selectedPlacesHTML = selectedPlacesHTML + '<li>' + this.selectedPlaces[i].name + '</li>';
      }
      
      this.itineraryHTML = 
        '<div class="itinerary-section">' +
          '<h4>Personal Details</h4>' +
          '<p><strong>Name:</strong> ' + this.form.fullName + '</p>' +
          '<p><strong>Gender:</strong> ' + (this.form.gender === 'male' ? 'Male' : 'Female') + '</p>' +
          '<p><strong>Date of Birth:</strong> ' + this.form.dob + '</p>' +
        '</div>' +
        '<div class="itinerary-section">' +
          '<h4>Selected Park Places</h4>' +
          '<ul>' + selectedPlacesHTML + '</ul>' +
        '</div>' +
        '<div class="itinerary-section">' +
          '<h4>Visitors Details</h4>' +
          '<p><strong>Total Visitors:</strong> ' + this.form.totalVisitors + '</p>' +
          '<p><strong>Children:</strong> ' + this.form.children + '</p>' +
          '<p><strong>Adults:</strong> ' + (this.form.totalVisitors - this.form.children) + '</p>' +
        '</div>' +
        '<div class="itinerary-section">' +
          '<h4>Accommodation</h4>' +
          '<p><strong>Selected Option:</strong> ' + accommodationText + '</p>' +
        '</div>' +
        '<div class="itinerary-section">' +
          '<h4>Payment Details</h4>' +
          '<p><strong>Name on Card:</strong> ' + this.form.cardName + '</p>' +
          '<p><strong>Card Number:</strong> **** **** **** ' + cardNumberLast4 + '</p>' +
          '<p><strong>Expiration Date:</strong> ' + this.form.expiryDate + '</p>' +
          '<p><strong>CVC:</strong> Provided</p>' +
        '</div>';
      
      this.showSummary = true;
      
      let self = this;
      setTimeout(function() {
        let summary = document.querySelector('.itinerary-summary');
        if (summary) {
          summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    },
    
    imgError(event) {
      event.target.src = 'assets/placeholder.jpg';
    }
  }
}).mount('#app');