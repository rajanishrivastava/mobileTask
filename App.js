import React, { Component, useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, AsyncStorage, processColor } from 'react-native';
import { debounce } from "debounce";
import {API_KEY}  from "react-native-dotenv";
/* 

  var searchedAdresses = adresses.filter(function(adress) {
    return adress.street.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
  });
  this.setState({searchedAdresses: searchedAdresses});
};
 */
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';



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
    }
  };


  componentDidMount = () => {
    this.getSavedAddr();
    this.ShowHideComponent();
  }


  getSavedAddr = async () => {
    //retrieve stored data for the first time
    try {
      var value = await AsyncStorage.getItem("fromAddr");
      if (value !== null) {
        this.setState({ fromAddr: value });
      }

      value = await AsyncStorage.getItem("toAddr");
      if (value !== null) {
        this.setState({ toAddr: value });;
      }
    } catch (error) {
      // Error retrieving data
    }
  }


  loadAdresses(searchedText, caller) {
    var t = this;

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    var placesURL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input='
      + searchedText + '&key='+API_KEY;
    /*    fetch(proxyUrl + placesURL)
         .then(
           function (response) {
             if (response.status !== 200) {
               console.log('Looks like there was a problem. Status Code: ' +
                 response.status);
               return;
             }
             // Examine the text in the response
             response.json().then(function (data) {
               //console.log(data);
               if (caller === "fromAddr") {
                 t.setState({ searchFromAdresses: data.predictions, fromOptionsShow: true });
               } else {
                 t.setState({ searchToAdresses: data.predictions, toOptionsShow: true });
               }
             });
           }
         )
         .catch(function (err) {
           console.log('Fetch Error :-S', err);
         })
    */
    function reqListener() {
      var data = JSON.parse(this.response);
      console.log(data);
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



  ShowHideComponent = () => {
    if (this.state.toAddr == "Von" || this.state.toAddr == "") {
      this.setState({ show: false });
    }else{
      this.setState({ show: true });
    }
  }

  setSaveFromAddr = async (text) => {
    this.setState({ fromAddr: text, fromOptionsShow: false, searchFromAdresses: [] });
    try {
      await AsyncStorage.setItem('fromAddr', text);
    } catch (error) {
      // Error saving data
    }
  }
  setSaveToAddr = async (text) => {
    this.setState({ toAddr: text, toOptionsShow: false, searchToAdresses: [] })
    try {
      await AsyncStorage.setItem('toAddr', text);
    } catch (error) {
      // Error saving data
    }
  }


  getFromAddr = (text) => {
    this.setState({ fromAddr: text });
    debounce(this.loadAdresses(text, "fromAddr"), 1000);
  }

  getToAddr = (text) => {
    this.setState({ toAddr: text });
    debounce(this.loadAdresses(text, "toAddr"), 1000);
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

  GetItem(item) {
    //Function for click on an item
    this.setState({ fromAddr: item.description });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={{ paddingLeft: 20, height: 40, borderColor: 'gray', borderWidth: 1, width: 250, maxHeight: 60 }}
          //placeholder="Von"
          value={this.state.fromAddr}
          onChangeText={this.getFromAddr}
        //onChangeText={debounce(this.loadAdresses, 500)}

        // onFocus={() => this.setState({ fromAddr: " " })}
        />
        {/* <FlatList
          data={this.state.searchedAdresses}
         renderItem={({ item }) => ( <Text> {item.description}  </Text> )}

         //renderItem={({ item }) => new Text(data : item.description }

          keyExtractor={item => item.place_id}

        /> */}
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
                  this.setSaveFromAddr(item.description)
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
                    this.setSaveToAddr(item.description)

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
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 4,
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


});

