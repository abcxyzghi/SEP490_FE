import { useState } from 'react';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import EditUserProfile from '../../tabs/EditUserProfile/EditUserProfile';
import UserAchievements from '../../tabs/UserAchievements/UserAchievements';
import UserTheme from '../../tabs/UserTheme/UserTheme';
import './Settingpage.css';

export default function Settingpage() {
  const [activeTab, setActiveTab] = useState('Profile Info');

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
              label: 'Medal Display ',
              content:
                <UserAchievements />
            },
          ]}
          activeTab={activeTab}
          onTabChange={(label) => setActiveTab(label)}
        />
      </div>

    </div>
  )
}
