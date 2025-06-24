import React from 'react';
import './CubeLoader.css';

function CubeLoader() {
    return (
        <div className="cube-loader">
            <div className="cube_item cube_x"></div>
            <div className="cube_item cube_y"></div>
            <div className="cube_item cube_y"></div>
            <div className="cube_item cube_x"></div>
        </div>

    )
}

export default CubeLoader