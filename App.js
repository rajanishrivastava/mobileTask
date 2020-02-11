import React, { Component } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, AsyncStorage, processColor } from 'react-native';
import { debounce } from "debounce";
import { API_KEY } from "react-native-dotenv";
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

/* import API, { graphqlOperation } from '@aws-amplify/api';
import { createTrip } from './src/graphql/mutations';
import config from './aws-exports'

API.configure(config);


async function createNewTrip(name, address) {
  const trip = { name: name, value: address }
  await API.graphql(graphqlOperation(createTrip, { input: trip }));
} */


export default class TripTask extends Component {



  constructor(props) {
    super(props);
    this.loadAdresses = this.loadAdresses.bind(this);
    this.state = {
      fromDate: new Date(),
      fromTime: new Date(),
      fromAddr: "Von",
      toDate: new Date(),
      toTime: new Date(),
      toAddr: "Nach",
      show: false,
      searchFromAdresses: [],
      searchToAdresses: [],
      fromOptionsShow: false,
      toOptionsShow: false,
      distance: 0,
    }
  };




  componentDidMount = () => {
    this.loadLocalSavedAddr();
    this.ShowHideComponent();
    this.syncToClouddb();
  }

  syncToClouddb = async () => {
   /*  try {

      var fromAddress = await AsyncStorage.getItem("fromAddr");
      createNewTrip("fromAddr", fromAddress);

      var toAddress = await AsyncStorage.getItem("toAddr");
      createNewTrip("toAddr", toAddress);

    } catch (error) {
      // Error retrieving data: TBD
    } */
  }

  loadLocalSavedAddr = async () => {
    //retrieve stored data for the first time
    try {
      var value = await AsyncStorage.getItem("fromAddr");
      if (value !== null) {
        this.setState({ fromAddr: value });
      }

      value = await AsyncStorage.getItem("toAddr");
      if (value !== null) {
        this.setState({ toAddr: value });
        this.getDistance();
      }

    } catch (error) {
      // Error retrieving data: TBD
    }
  }


  loadAdresses = (searchedText, caller) => {
    var t = this;

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    var placesURL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input='
      + searchedText + '&key=' + API_KEY;

    function reqListener() {
      var data = JSON.parse(this.response);
      //   console.log(data);
      if (caller === "fromAddr") {
        t.setState({ searchFromAdresses: data.predictions, fromOptionsShow: true });
      } else {
        t.setState({ searchToAdresses: data.predictions, toOptionsShow: true });
      }
    }

    function reqError(err) {
      console.log('Fetch Error :-S', err);
    }
    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.onerror = reqError;
    oReq.open('get', proxyUrl + placesURL, true);
    oReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    oReq.send();
  }


  getDistance = (from, to) => {

    //pick the old value from state variables and new value comes from parameter
    // Done to avid a bug where, the state varible is read out before being updated.
    if(from === ""){
      var from = this.state.fromAddr;
    }else{
      var to = this.state.toAddr;
    }

    if (to.localeCompare("Von") === 0 || to.localeCompare("Nach") === 0) {
      return;
    }


    var t = this;

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    var distanceURL = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + from + '&destinations=' +
      to + '&key=' + API_KEY

    function reqListener() {
      var data = JSON.parse(this.response);
      // console.log(data);
      // var origin =  data.origin_addresses[0];
      //var destination = data.destination_addresses[0];
      if (data.rows[0].elements != undefined && data.rows[0].elements[0].distance != undefined) {
        t.setState({ distance: data.rows[0].elements[0].distance.text });
        var addedDate = new Date(t.state.fromDate.getTime() + data.rows[0].elements[0].duration.value * 1000);
        t.setState({ toDate: addedDate });
        t.setState({ toTime: addedDate });
      }else{
        console.log("Distance Error");
      }

    }
    function reqError(err) {
      //  console.log('Fetch Error :-S', err);
    }
    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.onerror = reqError;
    oReq.open('get', proxyUrl + distanceURL, true);
    oReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    oReq.send();


  }

  ShowHideComponent = () => {
    if (this.state.toAddr == "Von" || this.state.toAddr == "") {
      this.setState({ show: false });
    } else {
      this.setState({ show: true });
    }
  }

  setAddressAndSaveLocal = async (text, key) => {
    if (key.localeCompare("fromAddr") === 0) {
      this.setState({ fromAddr: text, fromOptionsShow: false, searchFromAdresses: [] });
      this.getDistance(text, "");// to pass the value that is set directly
    } else {
      this.setState({ toAddr: text, toOptionsShow: false, searchToAdresses: [] });
      this.getDistance( "", text);
    }
    
     try {
      await AsyncStorage.setItem(key, text);
    } catch (error) {
      // Error saving data: TBD
    }
  }


  getFromAddr = (text) => {
    this.setState({ fromAddr: text });
    debounce(this.loadAdresses(text, "fromAddr"), 2000);
  }

  getToAddr = (text) => {
    this.setState({ toAddr: text });
    debounce(this.loadAdresses(text, "toAddr"), 2000);
    this.ShowHideComponent();
  }

  FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View
        style={{ height: 1, width: '100%', backgroundColor: '#C8C8C8' }}
      />
    );
  };



  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={{ paddingLeft: 20, height: 40, borderColor: 'gray', borderWidth: 1, width: 250, maxHeight: 60 }}
          //placeholder="Von"
          value={this.state.fromAddr}
          onChangeText={this.getFromAddr}
        />

        {this.state.fromOptionsShow ? <FlatList
          data={this.state.searchFromAdresses}
          //data defined in constructor
          ItemSeparatorComponent={this.FlatListItemSeparator}
          //Item Separator View
          renderItem={({ item }) => (
            // Single Comes here which will be repeatative for the FlatListItems
            <View>
              <Text
                style={styles.item}
                onPress={() => {
                  this.setAddressAndSaveLocal(item.description, "fromAddr")
                }} >
                {item.description}
              </Text>
            </View>
          )}
        /> : null}

        <DatePicker
          label="Abreisedatum"
          date={this.state.fromDate}
          onDateChange={date => { this.setState({ fromDate: date }) }
          }
        />

        <TimePicker
          label="Uhrzeit"
          date={this.state.fromTime}
          onTimeChange={time => { this.setState({ fromTime: time }) }
          }
        />


        <TextInput
          style={{ paddingLeft: 20, height: 40, borderColor: 'gray', borderWidth: 1, width: 250, maxHeight: 60 }}
          placeholder="Nach"
          value={this.state.toAddr}
          onChangeText={this.getToAddr}
        />

        {this.state.toOptionsShow ?
          <FlatList
            data={this.state.searchToAdresses}
            //data defined in constructor
            ItemSeparatorComponent={this.FlatListItemSeparator}
            //Item Separator View
            renderItem={({ item }) => (
              // Single Comes here which will be repeatative for the FlatListItems
              <View>
                <Text
                  style={styles.item}
                  onPress={() => {
                    this.setAddressAndSaveLocal(item.description, "toAddr")

                  }} >
                  {item.description}
                </Text>
              </View>
            )}
          /> : null}
        {this.state.show ? (
          <DatePicker
            label="Ankuftsdatum"
            date={this.state.toDate}
            onDateChange={date => {
              return this.setState({ fromDate: date });
            }}
          />
        ) : null}
        {this.state.show ? (

          <TimePicker
            label="Uhrzeit"
            date={this.state.toTime}
            onTimeChange={time => {
              return this.setState({ fromTime: time });
            }}
          />
        ) : null}


        <Text style={styles.titleText} >
          {this.state.distance}
        </Text>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 5,
    paddingTop: 30,
    paddingLeft: 20,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'ghostwhite'
  },

  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    width: "100%",
  },

  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },


});

