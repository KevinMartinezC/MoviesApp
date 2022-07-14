import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import Constants from "expo-constants";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView } from "react-native-gesture-handler";
import ChipGroup from "./../components/ChipGroup";
import TeaserTrailer from "./../models/TeaserTrailer";
import TrailerItem from "../components/TrailerItem";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { IMLocalized } from "../IMLocalized";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../contexts/ThemeContext";
import Cast from "./../models/Cast";
import CastItem from "../components/CastItem";
import * as Notifications from "expo-notifications";
import Moment from "moment";
const db = SQLite.openDatabase("movie.db");
import AsyncStorage from "@react-native-async-storage/async-storage";
import SnackBar from "react-native-snackbar-component";
import moment from "moment";
class MovieDetail extends Component {
  movieItem = null;
  baseUrl = "http://api.themoviedb.org/3/movie/";
  apiKey = "802b2c4b88ea1183e50e6b285a27696e";
  scrollHeight = 0;
 

  

  constructor(props) {
    super(props);
    this.movieItem = props.route.params.item;
 
    var topSpace = Constants.statusBarHeight + 10;
    this.scrollHeight =
      Dimensions.get("screen").height -
      (Platform.OS == "ios" ? 0 : topSpace) -
      70;
   
  }

  state = {
    teaserTrailers: [],
    activeMovieTrailerKey: "",
    modalVisible: false,
    castResults: [],
    isShow: true,
    isVisibleMessage: false,
    messageText: "",
  };

  checkDate = () => {
    var d = Moment(this.movieItem.release_date);
    var current = Date.now();

    var now = moment(current);

    var duration = moment.duration(d.diff(now));
    var days = duration.asDays();

    if (days <= 0) {
      this.setState({ isShow: false });
    }
  };

  componentDidMount() {
    
    return fetch(
      this.baseUrl + this.movieItem.id + "/videos?api_key=" + this.apiKey
    )
      .then((response) => response.json())
      .then((responseJson) => {
        var items = [];
        responseJson.results.map((movie) => {
          items.push(
            new TeaserTrailer({
              key: movie.key,
              name: movie.name,
              type: movie.type,
            })
          );
        });

        this.setState({ teaserTrailers: items });

        fetch(
          this.baseUrl + this.movieItem.id + "/credits?api_key=" + this.apiKey
        )
          .then((response) => response.json())
          .then((responseJson) => {
            var casts = [];
            responseJson.cast.map((cast) => {
              casts.push(
                new Cast({
                  id: cast.id,
                  name: cast.name,
                  profile_path: cast.profile_path,
                  character: cast.character,
                })
              );
            });
            this.setState({ castResults: casts });
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  }

  render() {
    return (
      <ThemeContext.Consumer>
        {(context) => {
          const { isDarkMode, light, dark } = context;
          return (
            <View style={styles.container}>
              <StatusBar style={isDarkMode ? "light" : "dark"} />
              <SnackBar
                visible={this.state.isVisibleMessage}
                textMessage={this.state.messageText}
                backgroundColor={isDarkMode ? light.bg : dark.bg}
                messageColor={isDarkMode ? dark.bg : light.bg}
              />
              <Modal
                style={{ position: "absolute", top: 0 }}
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                  this.setState({ modalVisible: false });
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#000",
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => this.setState({ modalVisible: false })}
                  >
                    <View
                      style={{
                        backgroundColor: "#222",
                        width: 48,
                        height: 48,
                        position: "absolute",
                        top: Constants.statusBarHeight + 10,
                        justifyContent: "center",
                        alignItems: "center",
                        left: 20,
                        borderRadius: 10,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color={"white"}
                      />
                    </View>
                  </TouchableWithoutFeedback>

                  <View style={{ width: "100%" }}>
                    <YoutubePlayer
                      play={true}
                      height={270}
                      videoId={this.state.activeMovieTrailerKey}
                    />
                  </View>
                </View>
              </Modal>
              <Image
                style={styles.poster}
                resizeMode={"cover"}
                source={{
                  uri: this.movieItem.backdrop_path,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <LinearGradient
                  colors={[
                    "#ffffff03",
                    isDarkMode ? dark.bg : light.bg,
                    isDarkMode ? "#000" : light.bg,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: Platform.OS == "ios" ? 0.6 : 0.7 }}
                  style={{ height: "100%" }}
                ></LinearGradient>
              </View>

              <View
                style={{
                  position: "absolute",
                  top: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.props.navigation.pop();
                  }}
                >
                  <MaterialCommunityIcons
                    style={{
                      position: "absolute",
                      top: Constants.statusBarHeight + 10,
                      left: 10,
                      zIndex: 1,
                      paddingRight: 20,
                      paddingBottom: 20,
                    }}
                    name="chevron-left"
                    size={24}
                    color={isDarkMode ? light.bg : dark.bg}
                  />
                </TouchableWithoutFeedback>
                {this.state.isShow ? (
                  <TouchableWithoutFeedback
                    onPress={() => this.favoriteProcess(this.movieItem)}
                  >
                    <MaterialCommunityIcons
                      style={{
                        position: "absolute",
                        top: Constants.statusBarHeight + 10,
                        right: 10,
                        zIndex: 1,
                        paddingLeft: 20,
                        paddingBottom: 20,
                      }}
                      size={24}
                      color={isDarkMode ? light.bg : dark.bg}
                    />
                  </TouchableWithoutFeedback>
                ) : (
                  <View />
                )}
                <View
                  style={{
                    marginTop: 70,
                    height: this.scrollHeight,
                  }}
                >
                  <ScrollView>
                    <View style={styles.posterSpace} />
                    <View
                      style={{
                        flex: 1,
                        padding: 20,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <View
                          style={{ flexWrap: "wrap", flexDirection: "column" }}
                        >
                          <Text
                            style={[
                              styles.title,
                              { color: isDarkMode ? light.bg : dark.bg },
                            ]}
                          >
                            {this.movieItem.title}
                          </Text>
                          <Text
                            style={[
                              styles.subtitle,
                              { color: isDarkMode ? light.bg : dark.bg },
                            ]}
                          >
                            {this.movieItem.release_date}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.ratingBadge,
                            {
                              backgroundColor: isDarkMode ? light.bg : dark.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rating,
                              { color: isDarkMode ? dark.bg : light.bg },
                            ]}
                          >
                            {this.movieItem.vote_average}
                          </Text>
                        </View>
                      </View>

                      <ChipGroup
                        datas={this.movieItem.genres}
                        context={context}
                      />
                      <Text
                        style={[
                          styles.header,
                          { color: isDarkMode ? light.bg : dark.bg },
                        ]}
                      >
                       Descripción
                      </Text>
                      <Text
                        style={{
                          fontFamily: "poppins-l",
                          fontSize: 15,
                          textAlign: "justify",
                          color: isDarkMode ? light.bg : dark.bg,
                        }}
                      >
                        {this.movieItem.overview}
                      </Text>
                      <Text
                        style={[
                          styles.header,
                          { color: isDarkMode ? light.bg : dark.bg },
                        ]}
                      >
                      Trailers
                      </Text>
                      <View style={{ flexWrap: "wrap", flexDirection: "row" }}>
                        {this.state.teaserTrailers.map((item, index) => {
                          return (
                            <TrailerItem
                              poster={this.movieItem.backdrop_path}
                              key={item.key}
                              context={context}
                              onPressFunction={() => {
                                this.setState({
                                  modalVisible: true,
                                  activeMovieTrailerKey: item.key,
                                });
                              }}
                              data={item}
                              modalVisible={this.state.modalVisible}
                              itemIndex={index}
                            />
                          );
                        })}
                      </View>
                      <View
                        style={{
                          justifyContent: "space-between",
                          flexDirection: "row",
                          flex: 1,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={[
                            styles.header,
                            { color: isDarkMode ? light.bg : dark.bg },
                          ]}
                        >
                          Actores
                        </Text>
                        <TouchableWithoutFeedback
                          onPress={() =>
                            this.props.navigation.navigate("CastViewAll", {
                              movieid: this.movieItem.id,
                            })
                          }
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "poppins-sb",
                                color: isDarkMode ? light.bg : dark.bg,
                              }}
                            >
                            Ver todo
                            </Text>
                            <MaterialCommunityIcons
                              name="chevron-right"
                              size={20}
                              color={isDarkMode ? light.bg : dark.bg}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                      <ScrollView>
                        {this.state.castResults.map((cast, index) => {
                          return index < 4 ? (
                            <CastItem
                              cast={cast}
                              context={context}
                              key={cast.id}
                            />
                          ) : (
                            <View key={cast.id} />
                          );
                        })}
                      </ScrollView>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  rating: {
    fontFamily: "poppins-sb",
    marginTop: 4,
  },
  ratingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "poppins-l",
  },
  poster: {
    height: 281,
  },
  posterSpace: {
    height: 210,
  },
  title: {
    fontSize: 17,
    fontFamily: "poppins-r",
  },
  header: {
    fontSize: 20,
    fontFamily: "poppins-sb",
    marginTop: 10,
  },
});

export default MovieDetail;
