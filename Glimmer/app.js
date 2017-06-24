/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {AsyncStorage} from 'react-native'
import {registerScreens} from './Workers/screens';
import {Navigation} from 'react-native-navigation';
import Workers from "./Workers/index.js";
import * as firebase from 'firebase';
global.moment = require('moment');
import {compose, applyMiddleware, createStore} from 'redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import glimmerReducers from './Redux/index';

import 'moment/locale/nb';
moment.locale('nb')

import GlimmerAuth from "./src/auth.js";
global.auth = new GlimmerAuth();

import Helpers from "./src/helpers";
global.helpers = new Helpers();

//Some hacks
console.ignoredYellowBox = ['[xmldom warning]'];

//Create the API updater object
global.arbeidsMaur = new Workers();

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD9d9frvKtl8PEOPS5Y6Uc7HDoxyopEJrA",
    authDomain: "glimmer-28101.firebaseapp.com",
    databaseURL: "https://glimmer-28101.firebaseio.com",
    projectId: "glimmer-28101",
    storageBucket: "glimmer-28101.appspot.com",
    messagingSenderId: "971596888536"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

//Create the Redux Store
global.store = createStore(glimmerReducers,
    undefined,
    compose(
        autoRehydrate()
    ));

function saveStore()
{
    if(__DEV__)
    {
        console.log("Persisting store", global.store.getState());
    }
    persistStore(global.store, {storage: AsyncStorage});
}

if(__DEV__)
{
    console.log("Store init", global.store.getState());
}

if(false && __DEV__)
{
    let unsubscribe = global.store.subscribe(() => {
        console.log("Store change", global.store.getState());
    })

}

registerScreens();

export default class App {

    constructor(){
        this.init();
    }

    init() {

        global.arbeidsMaur.forumUpdater.initForums(false);
        global.arbeidsMaur.kretsUpdater.initKrets(false);

        global.arbeidsMaur.forumUpdater.loadFirstFavorites(1);
        global.arbeidsMaur.forumUpdater.loadStream(1);

        setInterval(saveStore, 30000);

        this.startApp();

    }

    startApp() {
        Navigation.startTabBasedApp({
            passProps: {store: global.store}, //Pass the redux store.
            tabs: [
                {
                    label: 'Mine tråder',
                    screen: 'glimmer.PageFavorites', // this is a registered name for a screen
                    icon: require('./icons/star.png'),
                    //selectedIcon: require('./icons/ionicons/alert.png'), // iOS only
                    title: 'Mine tråder'
                },
                {
                    label: 'Forsiden',
                    screen: 'glimmer.PageStream',
                    icon: require('./icons/front.png'),
                    //selectedIcon: require('./icons/ionicons/alert.png'), // iOS only
                    title: 'Forsiden'
                }
                ,
                /*{
                    label: 'Kalender',
                    screen: 'glimmer.PageCalendar',
                    icon: require('./icons/calendar.png'),
                    //selectedIcon: require('./icons/ionicons/alert.png'), // iOS only
                    title: 'Kalender'
                }
                ,*/
                {
                    label: 'Meldinger',
                    screen: 'glimmer.PageMessages',
                    icon: require('./icons/chat.png'),
                    //selectedIcon: require('./icons/ionicons/alert.png'), // iOS only
                    title: 'Meldinger'
                }
                ,
               /* {
                    label: 'Velg forum',
                    screen: 'glimmer.PageForumList',
                    icon: require('./icons/chat.png'),
                    //selectedIcon: require('./icons/ionicons/alert.png'), // iOS only
                    title: 'Forum List Test'
                } */
            ],
            drawer: { // optional, add this if you want a side menu drawer in your app
                left: { // optional, define if you want a drawer from the left
                    screen: 'glimmer.MenuLeft', // unique ID registered with Navigation.registerScreen
                    passProps: {} // simple serializable object that will pass as props to all top screens (optional)
                },
                disableOpenGesture: false // optional, can the drawer be opened with a swipe instead of button
            },
            tabsStyle: { // optional, **iOS Only** add this if you want to style the tab bar beyond the defaults
                //tabBarHidden: false, // make the tab bar hidden
                //tabBarButtonColor: '#ffff00', // change the color of the tab icons and text (also unselected)
                //tabBarSelectedButtonColor: '#ff9900', // change the color of the selected tab icon and text (only selected)
                //tabBarBackgroundColor: '#551A8B', // change the background color of the tab bar
                //tabBarTranslucent: true, // change the translucent of the tab bar to false
                //tabBarTextFontFamily: 'Avenir-Medium', //change the tab font family
                //tabBarLabelColor: '#ffb700', // iOS only. change the color of tab text
                //tabBarSelectedLabelColor: 'red', // iOS only. change the color of the selected tab text
                //forceTitlesDisplay: true, // Android only. If true - Show all bottom tab labels. If false - only the selected tab's label is visible.
                //tabBarHideShadow: true, // iOS only. Remove default tab bar top shadow (hairline)
                //forceTitlesDisplay: true // Android only. If true - Show all bottom tab labels. If false - only the selected tab's label is visible.
            }

        });
    }

}