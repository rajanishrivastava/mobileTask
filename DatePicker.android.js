import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, DatePickerAndroid, StyleSheet } from 'react-native';



// Opens the "DatePickerAndroid" dialog and handles
// the response. The "onDateChange" function is
// a callback that's passed in from the container
// component and expects a "Date" instance.
const pickDate = (options, onDateChange) => {
  DatePickerAndroid.open(options).then(date =>
    onDateChange(new Date(date.year, date.month, date.day))
  );
};

// Renders a "label" and the "date" properties.
// When the date text is clicked, the "pickDate()"
// function is used to render the Android
// date picker dialog.
const DatePicker = ({ label, date, onDateChange }) => (
  <View style={styles.datePickerContainer}>
    <Text style={styles.datePickerLabel}>{label}</Text>
    <Text onPress={() => pickDate({ date }, onDateChange)}>
      {date.toLocaleDateString("en-DE")}
    </Text>
  </View>
);

DatePicker.propTypes = {
  label: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func.isRequired
};

export default DatePicker;



const styles = StyleSheet.create({
  datePickerContainer: {
    width: 200,
    margin: 20
  },

  datePickerLabel: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});
