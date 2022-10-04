import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../App';
import './UserAvatar.css';

const UserAvatar = ({ avatar, className, size }) => {
  const { authService } = useContext(UserContext); 
  const { avatarColor, avatarName } = authService;
  const { avatarColor: selectedColor, avatarName: selectedName } = avatar;
  return (
    <img 
      className={`avatar-icon ${className} ${size}`}
      style={{backgroundColor: selectedColor || avatarColor}} 
      src={selectedName || avatarName} 
      alt="avatar" 
    />
  )
}

UserAvatar.propTypes = {
  avatar: PropTypes.object,
  className: PropTypes.string,
  size: PropTypes.string,
}

UserAvatar.defaultProps = {
  avatar: {},
  className: '',
  size: 'lg',
}

export default UserAvatar;