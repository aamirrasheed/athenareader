import * as React from 'react';
import {title} from "@/components/primitives";

function YoutubeEmbed() {
    return ( 
        <div className="flex flex-col justify-center">
            <h1 className={title({ size: "sm"}) + " mx-auto mb-10"}>30 second demo:</h1>
            <div className="flex justify-center">
                <iframe width="728" height="410" src="https://www.youtube.com/embed/pFGzGp_J3NQ?si=INtOq0ZlVJqIKR2G" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
        </div>
    );
}

export default YoutubeEmbed;