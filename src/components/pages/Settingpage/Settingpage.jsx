import React, { useEffect, useState } from 'react';
import './Settingpage.css'
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import EditUserProfile from '../../tabs/EditUserProfile/EditUserProfile';
import UserTheme from '../../tabs/UserTheme/UserTheme';
import UserAchievements from '../../tabs/UserAchievements/UserAchievements';

export default function Settingpage() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className='settingpage-container'>

      {/* Tabs switcher */}
      <div className='tabs-switcher-section'>
        <SwitchTabs
          tabs={[
            {
              label: 'Profile Info',
              content:
                <EditUserProfile />
            },
            {
              label: 'Themes',
              content:
                <UserTheme />
            },
            {
              label: 'Collection Display ',
              content:
                <UserAchievements /> // Display 3 badges and 6 cards on profile func
            },
          ]}
          activeTab={activeTab}
          onTabChange={(label) => setActiveTab(label)}
        />
      </div>

    </div>
  )
}
