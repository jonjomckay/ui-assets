import React, { Component } from "react";
import FileBrowser from "react-keyed-file-browser";
import Imgix from 'react-imgix';
import moment from 'moment';
import UploadModal from './UploadModal';

import "./App.css";

import 'bootstrap/dist/css/bootstrap.css';
import "font-awesome/css/font-awesome.css";
import "react-keyed-file-browser/dist/react-keyed-file-browser.css";
import Loadable from "./Loadable";

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.jfif', '.jp2', '.png', '.tif', '.tiff', '.bmp', '.icns', '.ico', '.pdf', '.pct', '.psd', '.ai'];

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            files: [],
            isLoading: true,
            isUploadModalVisible: false,
            selectedFolder: ''
        }
    }

    componentDidMount = () => {
        this.fetchFiles();
    };

    fetchFiles = () => {
        this.sendAssetRequest('GET')
            .then(response => response.json())
            .then(response => {
                this.setState({
                    files: response,
                    isLoading: false
                });
            });
    };

    sendAssetRequest = (method, body) => {
        const request = {
            headers: {
                'Authorization': '',
                'Content-Type': 'application/json'
            },
            method: method
        };

        if (body) {
            request.body = JSON.stringify(body);
        }

        this.setState({
            isLoading: true
        });

        return fetch('http://10.1.2.85:22935/api/draw/1/assets', request);
    };

    onCreateFolder = (key) => {
        const body = {
            key: key
        };

        this.sendAssetRequest('POST', body)
            .then(() => this.fetchFiles());
    };

    onDeleteItem = (key) => {
        const body = {
            key: key
        };

        this.sendAssetRequest('DELETE', body)
            .then(() => this.fetchFiles());
    };

    onMoveItem = (oldKey, newKey) => {
        const body = {
            oldKey: oldKey,
            newKey: newKey
        };

        this.sendAssetRequest('PUT', body)
            .then(() => this.fetchFiles());
    };

    onSelectFolder = (key) => {
        this.setState({
            selectedFolder: key
        });
    };

    onToggleUploadModal = () => {
        this.setState({
            isUploadModalVisible: !this.state.isUploadModalVisible
        })
    };

    onUploadCompletion = () => {
        this.fetchFiles();
    };

    renderDetail = (props) => {
        const file = props.file;

        let thumbnail = <div>No preview available</div>;

        let isImage = IMAGE_EXTENSIONS.some(extension => file.key.endsWith(extension));
        if (isImage) {
            thumbnail = <Imgix src={ file.url } width={ 400 } height={ 250 } />
        }

        return (
            <ul class="list-unstyleds">
                <li>File URL: <a href={ props.file.url }>{ props.file.url }</a></li>
                <li>{ thumbnail }</li>
            </ul>
        )
    };

    render() {
        // We want to ignore any legacy thumbnails, and parse the date into a readable format by the library
        const files = this.state.files
            .filter(file => file.key.includes('mcith/') === false)
            .map(file => {
                return {
                    key: file.key.slice(37),
                    modified: moment.utc(file.modifiedAt),
                    size: file.size,
                    url: 'https://manywho-files.imgix.net/' + file.key
                }
            });

        const customActions = [
            <li key="upload-file">
                <button className="btn btn-primary btn-sm" onClick={ this.onToggleUploadModal }>
                    <i className="fa fa-upload" aria-hidden="true" /> Upload File
                </button>
            </li>
        ];

        return (
            <div className="App" style={{padding: '1em'}}>
                <Loadable isLoading={ this.state.isLoading }>
                    <FileBrowser
                        customActions={ customActions }
                        files={ files }
                        detailRenderer={ this.renderDetail }
                        onCreateFolder={ this.onCreateFolder }
                        onDeleteFile={ this.onDeleteItem }
                        onDeleteFolder={ this.onDeleteItem }
                        onMoveFile={ this.onMoveItem }
                        onMoveFolder={ this.onMoveItem }
                        onRenameFile={ this.onMoveItem }
                        onRenameFolder={ this.onMoveItem }
                        onSelectFolder={ this.onSelectFolder }
                    />
                </Loadable>

                <UploadModal
                    isVisible={ this.state.isUploadModalVisible }
                    onCompletion={ this.onUploadCompletion }
                    onToggle={ this.onToggleUploadModal }
                    selectedFolder={ this.state.selectedFolder }
                />
            </div>
        );
    }
}

export default App;
