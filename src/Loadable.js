import React, { Component } from 'react';

import './Loadable.css';

export default class Loadable extends Component {
    render() {
        let spinner;

        if (this.props.isLoading) {
            spinner = (
                <div className="spinner-container">
                    <div className="spinner" />
                </div>
            );
        }

        return (
            <div className="loadable">
                { spinner }

                { this.props.children }
            </div>
        )
    }
}