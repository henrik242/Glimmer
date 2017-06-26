/**
 * Created by kvasbo on 31.05.2017.
 */

import React from "react";
import {AsyncStorage, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Divider, Icon} from "react-native-elements";

//Get common list styles
const listStyles = require('../Styles/ListStyles');

export default class PageMessages extends React.Component {

    constructor(props) {
        super(props);

        this.state = {messages: []};

        this.readFromCache();

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    }

    onNavigatorEvent(event) {
        switch (event.id) {
            case 'willAppear':
                this.getMessageThreads();
                break;
            case 'didAppear':
                break;
            case 'willDisappear':
                break;
            case 'didDisappear':
                break;
        }
    }

    componentDidMount() {

    }


    readFromCache() {
        AsyncStorage.getItem('@Cache:Conversations', (err, result) => {
            if (!err && result !== null) {
                var resultP = JSON.parse(result);
                //console.log(resultP);
                this.setState({conversations: resultP.data})
            }
        });
    }

    getMessageThreads() {

        var uri = "/messages/conversations";

        api.makeApiGetCall(uri).then((data) => {

            try {
                AsyncStorage.setItem('@Cache:Conversations', JSON.stringify(data));
            } catch (error) {
                // Error saving data
            }

            this.setState({conversations: data.data});

        })

    }

    getMessages() {

        var out = [];

        for (conversation in this.state.conversations) {
            out.push(<Conversation key={this.state.conversations[conversation].user.name}
                                   data={this.state.conversations[conversation]}
                                   navigator={this.props.navigator}
            />);
        }

        return out;
    }


    render() {

        return (
            <ScrollView style={pageStyles.container}>
                {this.getMessages()}
            </ScrollView>
        );
    }
}

class Conversation extends React.Component {

    constructor(props) {

        super(props);

    }

    getTime() {

        return global.helpers.getCalendarTime(this.props.data.last_message.sent_at);

    }

    getMessageCount() {

        var uleste = "uleste";
        if (this.props.data.unread_count == 1) uleste = "ulest";

        var out = this.props.data.message_count + " meldinger, " + this.props.data.unread_count + " " + uleste;
        return out;
    }

    titleStyle() {
        if (this.props.data.unread_count == 0) {
            return listStyles.listTitle;
        }
        else {
            return listStyles.listTitleHighlight;
        }
    }

    render() {

        return (
            <View>
                <TouchableOpacity
                    onPress={ () => this.props.navigator.push({
                        screen: 'glimmer.PageConversation',
                        title: 'Chat med ' + this.props.data.user.name,
                        passProps: {user: this.props.data.user}
                    })}
                >
                    <View style={listStyles.whiteBox}>
                        <View style={listStyles.textBlock}>
                            <Text style={this.titleStyle()}>{this.props.data.user.name}</Text>
                            <Text style={listStyles.listSubtitle}>{this.getTime()}</Text>
                            <Text style={listStyles.listSubtitle}>{this.getMessageCount()}</Text>

                        </View>
                        <View style={listStyles.iconBlock}>
                            <Icon name="keyboard-arrow-right" color="#AAAAAA" size={30}/>
                        </View>

                    </View>
                </TouchableOpacity>
                <Divider style={listStyles.divider}/>
            </View>
        )
    }
}


const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 30,
        paddingRight: 0,
    },

});