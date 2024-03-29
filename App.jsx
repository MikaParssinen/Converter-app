import React, { useEffect } from 'react';
import { ScrollView,ImageBackground, StyleSheet, Text, View, Keyboard, TouchableOpacity, TextInput, TouchableWithoutFeedback, Image, FlatList } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SelectList } from 'react-native-dropdown-select-list'

import HorizontalPicker from '@vseslav/react-native-horizontal-picker';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location';




function HomeScreen() {

  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [land, setLand] = React.useState(null);
  
  React.useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location);
      console.log(location.coords.latitude);
      console.log(location.coords.longitude);
      

      try {
         const response = await fetch(

          "http://api.geonames.org/countryCodeJSON?lat="+location.coords.latitude+"&lng="+location.coords.longitude+"&username=Kingen420"
          
          );
        const YourLocation = await response.json();
        console.log("Yourlocation")
        console.log(YourLocation);
        setLand(YourLocation.countryCode);
        console.log(YourLocation.countryCode);
        
        
      } catch (error) {
        console.error('Error fetching your location:', error);
      }
    
    })();

  }, []);

  const changeCuntryByLocation = () => {
    switch (land) {
      case "SE":
        return {key:'SEK', value:'Swedish krona'};
      case "US":
        return {key:'USD', value:'US Dollar'};
      case "GB":
        return {key:'GBP', value:'British Pound'};
      case "CN":
        return {key:'CNY', value:'Chinese Yuan'};
      case "JP":
        return {key:'JPY', value:'Japanese Yen'};
      case "KR":
        return {key:'KRW', value:'South Korean Won'};
      default:
        return {key:'EUR', value:'Euro'};
     }
  }


  const [exchangeRates, setExchangeRates] = React.useState({});
  const [exchangeSymbols, setExchangeSymbols] = React.useState({});
 
  
  useEffect(() => {
    // Fetch exchange rates from the Fixer API
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          `http://data.fixer.io/api/latest?access_key=2dc032a1a2b51d945211df73c433b5f6&base=EUR&symbols=SEK,EUR,USD,GBP,CNY,JPY,KRW,AED,AFN`
          );
        const data = await response.json();
        console.log(data.rates);
        setExchangeRates(data.rates);
        console.log(exchangeRates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    const fetchExchangeSymbols = async () => {
      try {
        const response = await fetch(
          `http://data.fixer.io/api/symbols?access_key=2dc032a1a2b51d945211df73c433b5f6`
          );
        const symbols = await response.json();
        console.log(symbols);
        if (symbols && symbols.symbols) {
          console.log(symbols.symbols["SEK"])
          setExchangeSymbols(symbols);
        } else {
          console.error('Exchange symbols not available');
        }
      } catch (error) {
        console.error('Error fetching symbols', error);
      }
    };


    fetchExchangeSymbols();
    fetchExchangeRates();
  }, []); // Empty dependency array to fetch data only once on component mount

  //To select currency
  const [selectedCurrency1, setSelectedCurrency1] = React.useState(null);
  const [selectedCurrency2, setSelectedCurrency2] = React.useState("");
 
  //To input amount, and to show converted amount
  const [inputText, setInputText] = React.useState('');
  const [convertedAmount, setConvertedAmount] = React.useState(null);
  
  //Currency list to dropdown list
  const data = [
      {key:'SEK', value:'Swedish krona'},
      {key:'EUR', value:'Euro'},
      {key:'USD', value:'US Dollar'},
      {key:'GBP', value:'British Pound'}, 
      {key:'CNY', value:'Chinese Yuan'},
      {key:'JPY', value:'Japanese Yen'},
      {key:'KRW', value:'South Korean Won'},
      {key:'AED', value: 'United Arab Emirates Dirham'},
      {key:'AFN', value:'Afghan Afghani'}
  ];

  //If input amount and select currency change then convert currency
  React.useEffect(() => {
    convertCurrency();
  }, [inputText, selectedCurrency1, selectedCurrency2]);

  //To remove all letters from input amount
  const onChangedText = (text) =>  {
    setInputText(text.replace(/[^0-9]/g, ''))
    handleInputChange(text)
  }

  const handleCurrencyChange1 = (itemValue) => {
    if(selectedCurrency1 == null){
    setSelectedCurrency1(changeCuntryByLocation());
    }
    else{
      setSelectedCurrency1(itemValue);
    }
  };

  const handleCurrencyChange2 = (itemValue) => {
    setSelectedCurrency2(itemValue);
  };

  const handleInputChange = (text) => {
    setInputText(text);
    setConvertedAmount(null); // Set converted amount to null when input changes
  };
  
  const convertCurrency = () => {
    // Check if input, selected currency1 and selected currency2 is set
    if (inputText && selectedCurrency1 && selectedCurrency2) {
      // Get rates from state
      const amount = parseFloat(inputText); // Convert input to float
      // Check if amount is a number and rate is set
      if (!isNaN(amount))  { 
        const y = exchangeRates[selectedCurrency1];
        const x = amount;
        const converted = x / y * exchangeRates[selectedCurrency2];
        setConvertedAmount(converted.toFixed(3)); // Set converted amount to 3 decimals
      }
    }
  };

  const [isLandscape, setIsLandscape] = React.useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  );

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(Dimensions.get('window').width > Dimensions.get('window').height);
    };

    Dimensions.addEventListener('change', handleOrientationChange);

    return () => {
      Dimensions.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  const selectedStyles = isLandscape ? stylesLandscape : styles;
  const heigthOfList = isLandscape ? 40 : 200;

  const navigation = useNavigation(); //To navigate to next screen

  return (

    
    //To dismiss keyboard when click outside of input box
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground source={require('./assets/BGConverter.png')} style={[selectedStyles.container]}>
      <View style={[selectedStyles.boxed]}>
        <Text style={[selectedStyles.ConvertedText]}> {convertedAmount ? convertedAmount : '0.000'}
          <Text style={[selectedStyles.CurrenceyFont]}>{selectedCurrency2}</Text> 
        </Text>
        {console.log(land)}
        <View style={[selectedStyles.CurcenncyList]}>
          <SelectList 
            data={data} 
            defaultOption={changeCuntryByLocation()}
            setSelected={setSelectedCurrency1} 
            onSelected={(itemValue) => handleCurrencyChange1(itemValue)} 
            boxStyles={{backgroundColor: 'white',width: 150}}
            dropdownStyles={{backgroundColor: 'white', width: 150}}
            dropdownTextStyles={{color: 'black'}}
            placeholder = "Select Currency"
            search = {false}
            maxHeight = {[heigthOfList]}
          />

          <Text style={[selectedStyles.Arrow]}> -> </Text>
          
          <SelectList
            data={data} 
            setSelected={setSelectedCurrency2}
            onSelected={(itemValue) => handleCurrencyChange2(itemValue)}
            boxStyles={{backgroundColor: 'white', width: 150}}
            dropdownStyles={{backgroundColor: 'white', width: 150}}
            dropdownTextStyles={{color: 'black'}}
            placeholder = "Select Currency"
            search = {false}
            maxHeight = {[heigthOfList]}
            
          />

        </View>

        <TextInput 
          style={[selectedStyles.inputBox]} placeholder="Enter amount" 
          keyboardType="numeric"
          onChangeText={(text) => onChangedText(text)}
        />
      </View>

  
      <TouchableOpacity style={[selectedStyles.button]} onPress={() => navigation.navigate('Details')}>
        <View style={[selectedStyles.convertscreenbutton]}>
          <Text style={[selectedStyles.fonts]}> Exchange rates </Text>
        </View>
      </TouchableOpacity>
      
     </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

function DetailsScreen() {

  React.useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          `http://data.fixer.io/api/latest?access_key=2dc032a1a2b51d945211df73c433b5f6&base=EUR&symbols=SEK,EUR,USD,GBP,CNY,JPY,KRW`
        );
        const data = await response.json();
        setRates(data.rates);
        if (data) {
          calculateRates(data.rates);
        } else {
          console.error('Error fetching exchange rates: Missing rates data');
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    fetchExchangeRates();
  }, []);


  const [selectedCurrency, setSelectedCurrency] = React.useState('SEK');
  const [rates, setRates] = React.useState(null);
  
  const [CurrencyRate1, setCurrencyRate1] = React.useState("0");
  const [CurrencyRate2, setCurrencyRate2] = React.useState("0");
  const [CurrencyRate3, setCurrencyRate3] = React.useState("0");
  const [CurrencyRate4, setCurrencyRate4] = React.useState("0");
  const [CurrencyRate5, setCurrencyRate5] = React.useState("0");
  const [CurrencyRate6, setCurrencyRate6] = React.useState("0");
  const [CurrencyRate7, setCurrencyRate7] = React.useState('0');

  const Items = ['SEK', 'EUR', 'USD', 'GBP', 'CNY', 'JPY', 'KRW'];

  const CurrencyBox = React.memo(({ flagSource, rate }) => (
    
     <View style={[selectedStyles.CurrecyListScreen.CurrenceyBoxes]}>
       <Image defaultSource={flagSource} style={[selectedStyles.CurrecyListScreen.Flag]} />
       <View style={[selectedStyles.CurrecyListScreen.CurrenceyRateBox]}>
         {rates && <Text style={[selectedStyles.CurrecyListScreen.CurrenceyRateText]}>{rate}</Text>}
       </View>
    </View>
    
  ));

  const rendnerItem = (item, index) => (
    <View style={[selectedStyles.CurrecyListScreen.HorizontalPicker]}>
      <Text style={[selectedStyles.CurrecyListScreen.HorizontalPickerItem]}>
        {item}
      </Text>
    </View>
  );

  const handleCurrencyChangeByIndex = (index) => {
    // Control that index is valid
    if (index >= 0 && index < Items.length) {
      const selectedCurrency = Items[index];
      console.log('Handeling currency change by index');
      console.log(rates);
      setSelectedCurrency(selectedCurrency);
      console.log(selectedCurrency);
      try{  
        console.log(rates);
        if(rates){
          console.log('Calculating rates');
        }
      } 
      catch (error) {
        console.error('Error handling data:', error);
      }
    }
  };


  const calculateRates = () => {
    if (!rates) return;
  
    const y = 1.0;
    const x = rates[selectedCurrency];
    const convertedRates = {};
  
    Object.keys(rates).forEach((currency) => {
      if (currency !== selectedCurrency) {
        const convertedValue = (y / x) * rates[currency];
        convertedRates[currency] = convertedValue.toFixed(4);
      } else {
        convertedRates[currency] = y.toFixed(4);
      }
    });
  
    // Update state
    setCurrencyRate1(convertedRates['SEK']);
    setCurrencyRate2(convertedRates['CNY']);
    setCurrencyRate3(convertedRates['EUR']);
    setCurrencyRate4(convertedRates['KRW']);
    setCurrencyRate5(convertedRates['GBP']);
    setCurrencyRate6(convertedRates['JPY']);
    setCurrencyRate7(convertedRates['USD']);
  };
  
  React.useEffect(() => {
  calculateRates();
}, [selectedCurrency, rates] );


const [isLandscape, setIsLandscape] = React.useState(
  Dimensions.get('window').width > Dimensions.get('window').height
);

React.useEffect(() => {
  const handleOrientationChange = () => {
    setIsLandscape(Dimensions.get('window').width > Dimensions.get('window').height);
  };

  Dimensions.addEventListener('change', handleOrientationChange);

  return () => {
    Dimensions.removeEventListener('change', handleOrientationChange);
  };
}, []);

const selectedStyles = isLandscape ? stylesLandscape : styles;
const procent = isLandscape ? '50%' : '100%';

  return (
    <ImageBackground source={require('./assets/BGConverter.png')} style={[selectedStyles.container]}>
      
      <View style={[selectedStyles.CurrecyListScreen.BoxIn2ndScreen] }>
        <View style={[selectedStyles.CurrecyListScreen.CurrentCurrenceyBox]}>
          <Text style={[selectedStyles.CurrecyListScreen.CurrentCurrenceyText]}>
            Conversion rate for: {selectedCurrency}
          </Text>
        </View>
        
          <ScrollView vertical={true} style={[selectedStyles.CurrecyListScreen.scrollView]}>
           
            <CurrencyBox flagSource={require('./assets/sweden.png')} rate={CurrencyRate1} />
            <CurrencyBox flagSource={require('./assets/china.png')} rate={CurrencyRate2} />
            <CurrencyBox flagSource={require('./assets/european-union.png')} rate={CurrencyRate3} />
            <CurrencyBox flagSource={require('./assets/south-korea.png')} rate={CurrencyRate4} />
            <CurrencyBox flagSource={require('./assets/united-kingdom.png')} rate={CurrencyRate5} />
            <CurrencyBox flagSource={require('./assets/japan.png')} rate={CurrencyRate6} />
            <CurrencyBox flagSource={require('./assets/united-states.png')} rate={CurrencyRate7} />
           
          </ScrollView>
        
      </View>

      <View style={[selectedStyles.CurrecyListScreen.CurrenceyListBox]}>
        <HorizontalPicker
        data={Items}
        renderItem={rendnerItem}
        onChange={(index) => handleCurrencyChangeByIndex(index)}
        itemWidth={175}
        snapToAlignment="center"
        />
      </View>
        

    </ImageBackground>
  );
}

const Stack = createNativeStackNavigator();

function App() {

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Currency Converter',
          
          }}
          />
          <Stack.Screen 
          name="Details" 
          component={DetailsScreen}
          options={{
            title: 'Exchange rates',
            headerStyle: {
              backgroundColor: 'rgba(78,153,77, 1)',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
          />
        </Stack.Navigator>
      </NavigationContainer>
  
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection:'row ',
  },
  boxed: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row ',
    backgroundColor: 'rgba(0,0,0, 0.5)',
    borderRadius: 10,
    padding: 8,
    width: 365,
  },
  convertscreenbutton: {
    backgroundColor: "#fff",
    padding: 15,
    width: 300,
    height: 50,
    alignItems: 'center',
    borderRadius: 10,
  },
  fonts: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    marginTop : 200,
  },
  inputBox: { 
    width: 300,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 15,
    fontSize: 15,
    marginTop: 50,
  },
  ConvertedText: {
    width: 350,
    height: 70,
    backgroundColor: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign : 'center',
    textAlignVertical: 'center',
    padding: 10,
    borderWidth: 3,
    marginTop: 10,
    borderColor: 'lightgray',
  },
  CurcenncyList: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: 350,
    height: 100,
    alignContent : 'center',
    marginTop: 10,
  },
  Arrow: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 15,
  },
  CurrenceyFont: {
    fontSize: 20,
    fontWeight: 'thin',
  },
  CurrecyListScreen: {
    BoxIn2ndScreen:{
      width: 350,
      height: 480,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 10,
      alignItems: 'center',
      padding: 20,
    },
    CurrentCurrenceyBox:{
      width: 300,
      height: 64,
      backgroundColor: '#4E994D',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      shadowColor: '#000',
        shadowOffset: {
          width: 2,
          height: 2,
       },
      shadowOpacity: 0.8,
      shadowRadius: 7,
    },
    CurrentCurrenceyText:{
      fontSize: 23,
      fontWeight: 'bold',
      color: '#fff',
    },
    Flag:{
      width: 64,
      height: 64,
      borderRadius: 64 / 2,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.4)',
    },
    CurrenceyRateBox:{
      width: 210,
      height: 64,
      backgroundColor: '#4E994D',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      shadowColor: '#000',
        shadowOffset: { 
          width: 2,
          height: 2,
        },
      shadowOpacity: 0.8,
      shadowRadius: 7,
    },
    CurrenceyRateText:{
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    CurrenceyBoxes:{
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: 350,
      height: 80,
      alignContent: 'center',
      flex: 1,
    },
    scrollView: {
      marginTop: 20,
      width: 350,
      height: 110,
    },
    CurrenceyListBox: {
      width: 350,
      height: 70,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 10,
      
      
    },
    HorizontalPicker: {
      width: 175,
      height: 50, // Höjden av ditt val
      marginTop: 10,
      alignSelf: 'center',
      alignItems: 'center',
      
    },
    HorizontalPickerItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: 70,
      backgroundColor: 'rgba(78,153,77, 0.9)',
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      lineHeight: 50,
      
    },


  },

});

const stylesLandscape = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection:'row ',
  },
  boxed: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row ',
    backgroundColor: 'rgba(0,0,0, 0.5)',
    borderRadius: 10,
    padding: 8,
    width: 500,
  },
  convertscreenbutton: {
    backgroundColor: "#fff",
    padding: 15,
    width: 300,
    height: 50,
    alignItems: 'center',
    borderRadius: 10,
  },
  fonts: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  inputBox: { 
    width: 300,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 15,
    fontSize: 15,
    marginTop: 1,
  },
  ConvertedText: {
    width: 350,
    height: 70,
    backgroundColor: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign : 'center',
    textAlignVertical: 'center',
    padding: 10,
    borderWidth: 3,
    marginTop: 10,
    borderColor: 'lightgray',
  },
  CurcenncyList: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: 350,
    height: 100,
    alignContent : 'center',
    marginTop: 10,
  },
  Arrow: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 15,
  },
  CurrenceyFont: {
    fontSize: 20,
    fontWeight: 'thin',
  },
  CurrecyListScreen: {
    BoxIn2ndScreen:{
      width: 600,
      height: 250,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 10,
      alignItems: 'center',
      padding: 20,
    },
    CurrentCurrenceyBox:{
      marginTop: -16,
      width: 300,
      height: 64,
      backgroundColor: '#4E994D',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      shadowColor: '#000',
        shadowOffset: {
          width: 2,
          height: 2,
       },
      shadowOpacity: 0.8,
      shadowRadius: 7,
    },
    CurrentCurrenceyText:{
      fontSize: 23,
      fontWeight: 'bold',
      color: '#fff',
    },
    Flag:{
      width: 64,
      height: 64,
      borderRadius: 64 / 2,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.4)',
    },
    CurrenceyRateBox:{
      width: 210,
      height: 64,
      backgroundColor: '#4E994D',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
        shadowOffset: { 
          width: 2,
          height: 2,
        },
      shadowOpacity: 0.8,
      shadowRadius: 7,
    },
    CurrenceyRateText:{
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    CurrenceyBoxes: {
      
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: 290,
      height: 80,
      alignContent: 'center',
      flexWrap: 'wrap', 
    },
    scrollView: {
      flexDirection: 'column',
      marginTop: 20,
      width: 300,
      height: 150, 
      
    },
    CurrenceyListBox: {
      width: 350,
      height: 70,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 10,
    },

    HorizontalPicker: {
      width: 175,
      height: 50, // Höjden av ditt val
      marginTop: 10,
      alignSelf: 'center',
      alignItems: 'center',
    },
    HorizontalPickerItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: 70,
      backgroundColor: 'rgba(78,153,77, 0.9)',
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      lineHeight: 50,
    },
   
   
  },

});
