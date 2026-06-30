import React from 'react';
import type { DigitContractType } from '../../hooks/digits/useDigitTrade';
import './ContractTypeSelector.scss';

export const CONTRACT_TYPES = [
    { type: 'DIGITMATCH' as DigitContractType, label: 'Matches', icon: '＝', description: 'Win if last digit equals your pick'            },
    { type: 'DIGITDIFF'  as DigitContractType, label: 'Differs', icon: '≠', description: 'Win if last digit differs from your pick'       },
    { type: 'DIGITOVER'  as DigitContractType, label: 'Over',    icon: '›', description: 'Win if last digit is higher than your pick'     },
    { type: 'DIGITUNDER' as DigitContractType, label: 'Under',   icon: '‹', description: 'Win if last digit is lower than your pick'      },
    { type: 'DIGITEVEN'  as DigitContractType, label: 'Even',    icon: '2', description: 'Win if last digit is an even number'            },
    { type: 'DIGITODD'   as DigitContractType, label: 'Odd',     icon: '1', description: 'Win if last digit is an odd number'             },
];

interface Props {
    selected: DigitContractType;
    onChange: (type: DigitContractType) => void;
}

export const ContractTypeSelector: React.FC<Props> = ({ selected, onChange }) => (
    <div className='contract-type-selector'>
        <div className='contract-type-selector__label'>Contract Type</div>
        <div className='contract-type-selector__grid'>
            {CONTRACT_TYPES.map(ct => (
                <button
                    key={ct.type}
                    type='button'
                    className={`contract-type-btn ${selected === ct.type ? 'contract-type-btn--active' : ''}`}
                    onClick={() => onChange(ct.type)}
                >
                    <span className='contract-type-btn__icon'>{ct.icon}</span>
                    <span className='contract-type-btn__label'>{ct.label}</span>
                </button>
            ))}
        </div>
        <p className='contract-type-selector__description'>
            {CONTRACT_TYPES.find(ct => ct.type === selected)?.description}
        </p>
    </div>
);
