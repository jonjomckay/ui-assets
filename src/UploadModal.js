import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';

import './UploadModal.css';

export default class UploadModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            files: []
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.isVisible === false) {
            this.setState({
                files: []
            });
        }
    };

    changeFileStatus = (file, status) => {
        const files = this.state.files.map(f => {
            if (f.id === file.id) {
                f.status = status;
            }

            return f;
        });

        this.setState({
            files: files
        });
    };

    markFileFinished = (file) => {
        this.changeFileStatus(file, 'finished');
    };

    markFileUploading = (file) => {
        this.changeFileStatus(file, 'uploading');
    };

    uploadFile = (file) => {
        this.markFileUploading(file);

        const request = {
            body: JSON.stringify({
                contentType: file.file.type,
                key: file.file.name
            }),
            headers: {
                'Authorization': '',
                'Content-Type': 'application/json'
            },
            method: 'POST'
        };

        fetch('http://10.1.2.85:22935/api/draw/1/assets/upload', request)
            .then(response => response.json())
            .then(response => {
                const uploadRequest = {
                    body: file.file,
                    method: 'PUT'
                };

                fetch(response, uploadRequest)
                    .then(response => this.markFileFinished(file))
                    .then(response => this.props.onCompletion());
            });
    };

    onUploadFiles = (acceptedFiles) => {
        const files = acceptedFiles.map((file, i) => {
            return {
                id: i,
                file: file,
                status: 'pending'
            };
        });

        this.setState({ files }, () => {
            files.forEach(this.uploadFile);
        });
    };

    render() {
        let files = 'No files chosen';

        if (this.state.files.length) {
            files = this.state.files.map((file, i) => {
                let statusIcon;

                switch (file.status) {
                    case 'pending':
                        statusIcon = 'fa fa-pause text-muted';
                        break;
                    case 'uploading':
                        statusIcon = 'fa fa-circle-o-notch fa-spin fa-fw text-warning';
                        break;
                    case 'finished':
                        statusIcon = 'fa fa-check text-success';
                        break;
                    default:
                        statusIcon = 'fa fa-question text-danger';
                        break;
                }

                return (
                    <div key={ i }>
                        <i className={ statusIcon } /> { file.file.name }
                    </div>
                )
            });
        }

        return (
            <Modal show={ this.props.isVisible } onHide={ this.props.onToggle }>
                <Modal.Header closeButton>
                    <Modal.Title>Upload files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Uploading files into <strong>/{ this.props.selectedFolder }</strong></p>

                    <Dropzone className="dropzone" onDrop={ this.onUploadFiles }>
                        Click to choose files, or drag &amp; drop to upload
                    </Dropzone>

                    <h4>Upload Progress</h4>

                    <div>
                        { files }
                    </div>
                </Modal.Body>
            </Modal>
        )
    }
}

UploadModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onCompletion: PropTypes.func,
    onToggle: PropTypes.func.isRequired,
    selectedFolder: PropTypes.string.isRequired
};