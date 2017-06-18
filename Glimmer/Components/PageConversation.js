/**
 * Created by kvasbo on 31.05.2017.
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ScrollView
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';


export default class PageConversation extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {messages: []};
        this.onSend = this.onSend.bind(this);
        this.parseMessageForGiftedChat = this.parseMessageForGiftedChat.bind(this);
    }

    static navigationOptions = ({ navigation }) => ({
        title: "Meldinger med "+navigation.state.params.user.name
    });

    componentWillMount() {

        var uri = "/messages/with/"+this.props.navigation.state.params.user.id;

        auth.makeApiGetCall(uri, (result)=> {

            console.log("Messages", result);

            var msg = [];

            for (message in result.data)
            {
                var m = this.parseMessageForGiftedChat(result.data[message]);
                msg.push(m);
            }

           this.setState({messages:msg});

        })

        /*this.setState({
            messages: [
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://facebook.github.io/react/img/logo_og.png',
                    },
                },
            ],
        });*/
    }

    parseMessageForGiftedChat(mess)
    {
        var userInfo = mess.from;

        out = {};
        out._id = mess.id;
        out.text = mess.body.replace(/<(?:.|\n)*?>/gm, '');;
        out.createdAt = mess.sent_at;
        out.user = {};
        out.user._id = userInfo.id;
        out.user.name = userInfo.name;
        out.user.avatar = userInfo.image_url;

        return out;

    }

    componentDidMount()
    {

    }

    onSend(messages = []) {

        var payload = {user_id:this.props.navigation.state.params.user.id, body:messages[0].text};

        console.log(payload);

        global.auth.makeApiPostCall("/messages", payload, (data) => {
            console.log(data);
        } )

        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });
    }
    render() {
        return (
            <GiftedChat
                locale="nb"
                messages={this.state.messages}
                onSend={this.onSend}
                user={{
                    _id: global.auth.loggedInUserId,
                }}
            />
        );
    }
}

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#CCCCCC',
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 30,
        paddingRight: 0,
    },
});