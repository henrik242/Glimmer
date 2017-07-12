/**
 * Created by kvasbo on 31.05.2017.
 */

import React from "react";
import PropTypes from "prop-types";
import {Alert, FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {setActivePostingForum} from "../Redux/actions";
import * as colors from "../Styles/colorConstants";

export default class PageForumList extends React.Component {

    reduxUnsubscribe = null;

    filters = {
        special: ["populære"],
        alpha: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "æ", "ø", "å"],
        theEnd: ["#"],
    }

    constructor(props) {
        super(props);

        this.forumsRef = firebaseApp.database().ref("forums");
        this.state = {
            filter: this.filters.special[0], //Hard coded as the first choice.
            loading: true,
            forums: [],
            chosenForum: store.getState().AppStatus.activePostingForum,
            chosenForumName: null,
            chosenForumBody: null,
            muchUsedForums: [],
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Skriv', // for a textual button, provide the button title (label)
                id: 'skriv', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                showAsAction: 'ifRoom', // optional, Android only. Control how the button is displayed in the Toolbar. Accepted valued: 'ifRoom' (default) - Show this item as a button in an Action Bar if the system decides there is room for it. 'always' - Always show this item as a button in an Action Bar. 'withText' - When this item is in the action bar, always show it with a text label even if it also has an icon specified. 'never' - Never show this item as a button in an Action Bar.
            }
        ]
    };

    onNavigatorEvent(event) {
        switch (event.id) {
            case 'willAppear':
                break;
            case 'didAppear':
                break;
            case 'willDisappear':
                break;
            case 'didDisappear':
                break;
        }

        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id == 'skriv') { // this is the same id field from the static navigatorButtons definition

                if (store.getState().AppStatus.activePostingForum !== null) {
                    this.props.navigator.push({
                        screen: 'glimmer.PageNewForumPost', // unique ID registered with Navigation.registerScreen
                        title: "Nytt innlegg", // navigation bar title of the pushed screen (optional)
                        animated: true, // does the push have transition animation or does it happen immediately (optional)
                    });
                }
                else {
                    Alert.alert("Hoppsann", "Du må velge et forum å poste i.");
                }

            }
        }
    }

    componentWillMount() {

        this.listenForForums(this.forumsRef);

        this.setState({chosenForum: store.getState().AppStatus.activePostingForum});

        //Listen to state changes. This really needs to change at some later point.
        this.reduxUnsubscribe = store.subscribe(() => {

                var newForum = store.getState().AppStatus.activePostingForum;

                if (newForum !== this.state.chosenForum) {
                    this.setState({chosenForum: newForum});

                    arbeidsMaur.forumListUpdater.getForumInfo(newForum).then((data) => {
                        this.setState({chosenForumName: data.title, chosenForumBody: data.body});
                    });

                }

            }
        )
    }

    componentWillUnmount() {
        this.reduxUnsubscribe();
        this.forumsRef.off();
    }

    //Connect to Firebase
    listenForForums(forumsRef) {

        forumsRef.on('value', (snap) => {

            var forums = snap.val();

            if (typeof(forums.list) !== "undefined" && typeof(forums.muchused) !== "undefined") {
                this.setState({
                    forums: forums.list,
                    muchUsedForums: forums.muchused,
                    loading: false
                });

            }

        });

    }

    getFilterList() {

        var out = [];

        for (let key in this.filters.special) {
            out.push(
                <View key={this.filters.special[key]}>
                    <TouchableOpacity
                        onPress={() => this.setFilter(this.filters.special[key])}>
                        <Text style={pageStyles.selectionLetter}
                        >{this.filters.special[key]}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        for (let key in this.filters.alpha) {

            out.push(
                <View key={this.filters.alpha[key]}>
                    <TouchableOpacity
                        onPress={() => this.setFilter(this.filters.alpha[key])}>
                        <Text style={pageStyles.selectionLetter}
                        >{this.filters.alpha[key]}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        for (let key in this.filters.theEnd) {

            out.push(
                <View key={this.filters.theEnd[key]}>
                    <TouchableOpacity
                        onPress={() => this.setFilter(this.filters.theEnd[key])}>
                        <Text style={pageStyles.selectionLetter}
                        >{this.filters.theEnd[key]}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return out;

    }

    setFilter(filter) {
        this.setState({filter: filter});
    }

    getFilteredForumList() {

        var arr = this.state.forums;
        var filter = this.state.filter;

        //Clean out null data due to quirk in Firebase
        arr = arr.filter((x) => {
            if (x == null) return false;
            return true
        });

        arr.sort((x, y) => {
            return x.title.trim().localeCompare(y.title.trim());
        });

        if (this.state.filter === "populære") {

            var muchUsed = []; //= this.state.muchUsedForums;
            //Lag array av mye brukte
            for (let key in this.state.muchUsedForums) {
                muchUsed.push(this.state.muchUsedForums[key]);
            }

            arr = arr.filter((x) => {
                return (muchUsed.includes(x.id))
            });

            return arr;
        }
        else if (this.state.filter === "#") {

            return arr.filter((forum) => {
                return !this.filters.alpha.includes(forum.title.toLocaleLowerCase().substring(0,1));
            })

        }
        else {
            return arr.filter((forum) => {
                return forum.title.toLocaleLowerCase().indexOf(this.state.filter.toLocaleLowerCase()) === 0;
            })
        }

    }


    render() {

        return (
            <View style={{flex: 1}}>


                <View style={{flex: 1, paddingTop: 0}}>

                    <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                        {this.getFilterList()}
                    </View>


                    <FlatList style={pageStyles.container}
                              data={this.getFilteredForumList()}
                              keyExtractor={(item, index) => item.id}
                              renderItem={({item}) => <Forum forum={item}></Forum>}
                    />

                </View>

            </View>

        );
    }
}

/*

 <View style={{height: 70, alignItems: "center", justifyContent: "center", margin: 0}}>
 <Text style={{fontSize: 20}}>{this._getChosenForumInfo()}</Text>
 </View>

 <View style={{flexDirection: "row", height: 50, backgroundColor: colors.COLOR_GRAD2}}>

 <View style={{flex: 1, padding: 10, flexDirection: "row", alignItems: "center"}}>
 <TextInput
 style={{
 height: 33,
 borderColor: colors.COLOR_LIGHT,
 color: colors.COLOR_DARKGREY,
 backgroundColor: colors.COLOR_WHITE,
 fontSize: 13,
 borderWidth: 1,
 padding: 5,
 paddingLeft: 10,
 paddingRight: 10,
 margin: 0,
 flex: 1
 }}
 onChangeText={(text) => this.setState({filterText: text})}
 value={this.state.text}
 placeholder="Filtrér"
 />
 </View>

 <View style={{
 flex: 1,
 padding: 10,
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-around"
 }}>

 <Text style={{color: colors.COLOR_LIGHT, marginRight: 5}}>Kun velbrukte:</Text>

 <Switch
 onValueChange={(value) => this.setState({onlyMostUsed: value})}
 value={this.state.onlyMostUsed}
 />

 </View>


 </View>

 */

PageForumList.propTypes = {
    navigator: PropTypes.object.isRequired,
}

class Forum extends React.Component {

    styles = new StyleSheet.create({

        forumContainer: {
            height: 20,
            margin: 5,
            padding: 5,

        },

        forumText: {
            color: colors.COLOR_WHITE,
        },

        selectedText: {
            color: colors.COLOR_HIGHLIGHT,
        }

    });

    render() {

        return (
            <TouchableOpacity onPress={() => {
                store.dispatch(setActivePostingForum(this.props.forum.id));
            }}>
                <View style={this.styles.forumContainer}>
                    <Text style={this.styles.forumText}>{this.props.forum.title}</Text>
                </View>
            </TouchableOpacity>
        )

    }
}

Forum.propTypes = {
    forum: PropTypes.object.isRequired
}

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.COLOR_DARKGREY,
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 30,
        paddingRight: 0,
    },

    selectionLetter: {
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 6,
        paddingRight: 6,
        margin: 3,
        fontSize: 16,
    }

});
