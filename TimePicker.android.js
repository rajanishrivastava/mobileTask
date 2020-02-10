import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, TimePickerAndroid, StyleSheet } from 'react-native';


// Opens the "TimePickerAndroid" dialog and handles
// the response. The "onTimeChange" function is
// a callback that's passed in from the container
// component and expects a "Date" instance.
const pickDate = (options, onTimeChange) => {
  TimePickerAndroid.open(options).then(time =>
    onTimeChange(new Date(0, 0, 1, time.hour, time.minute))
  );
};

// Renders a "label" and the "date" properties.
// When the date text is clicked, the "pickDate()"
// function is used to render the Android
// date picker dialog.
const TimePicker = ({ label, date, onTimeChange }) => (
  <View style={styles.datePickerContainer}>
    <Text style={styles.datePickerLabel}>{label}</Text>
    <Text onPress={() => pickDate({ date }, onTimeChange)}>
      {date.toLocaleTimeString("en-DE")}
    </Text>
  </View>
);

TimePicker.propTypes = {
  label: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  onTimeChange: PropTypes.func.isRequired
};

export default TimePicker;



const styles = StyleSheet.create({
   datePickerContainer: {
    width: 100,
    margin: 20
  },

  datePickerLabel: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});
