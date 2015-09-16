import {html} from '../scripts/client/templateHandler.js';

export const fileList = (first, items) => html`
    <ul>
        <li onclick="main.navigate('${first.path}');">
            ${first.text}
        </li>
        <li onclick="main.navigate('..');">
            &#8593; <span>Up a directory</span>
        </li>
        ${items.map(item => html`
            <li onclick="main.navigate('$${item}');">
                $${item}
            </li>
        `)}
    </ul>
`;

export const subtitleList = items => html`
    <ul>
        <li onclick="main.navigate('..');">
            &#8592; Back
        </li>
        <li onclick="UIController.subtitlePicked('');">
            None
        </li>
        ${items.map(item => html`
            <li onclick="UIController.subtitlePicked('$${item.path}');">
                $${item.name}
            </li>
        `)}
    </ul>
`;
