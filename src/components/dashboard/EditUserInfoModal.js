import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import Modal from '../Modal';
import Spacer from '../Spacer';
import Button from '../Button';
import { AppContext } from '../../providers/AppProvider';
import { FirebaseContext } from '../../providers/FirebaseProvider';
// import { AuthContext } from '../../providers/DatabaseProvider';
import { isBrowser } from '../../utils/isBrowser';
import Loader from '../Loader';
import { DatabaseContext } from '../../providers/DatabaseProvider';

const EditUserInfoModal = () => {
  const { firebase, firebaseUser } = useContext(FirebaseContext);
  const { q, serverClient, faunaUser } = useContext(DatabaseContext);

  const [stateName, setStateName] = useState(faunaUser.data.name || '');
  const [loading, setLoading] = useState(false);
  const [stateEmail, setStateEmail] = useState(faunaUser.data.email || '');

  console.log(faunaUser);

  const {
    setEditUserInfoModalOpen,
    setNotificationMessage,
    setNotificationType,
    setPasswordModalOpen,
    setFunction,
  } = useContext(AppContext);

  const onNameChange = (e) => {
    setStateName(e.target.value);
  };

  const onEmailChange = (e) => {
    setStateEmail(e.target.value);
  };

  const updateNameAndEmail = () => {
    setLoading(true);

    firebase
      .auth()
      .currentUser.updateProfile({
        displayName: `${stateName}`,
      })
      .then((res) => {
        console.log('Success! ', res);

        serverClient
          .query(
            q.Update(q.Ref(q.Collection('users'), faunaUser.ref.value.id), {
              data: {
                name: stateName,
              },
            })
          )
          .then((faunaResponse) => {
            console.log(faunaResponse);
          })
          .catch((faunaError) => console.log(faunaError));

        if (
          stateEmail !== firebaseUser.email ||
          stateEmail !== faunaUser.data.email ||
          firebaseUser.email !== faunaUser.data.email
        ) {
          firebase
            .auth()
            .currentUser.updateEmail(`${stateEmail}`)
            .then((resTwo) => {
              console.log('Success! ', resTwo);

              serverClient
                .query(
                  q.Update(q.Ref(q.Collection('users'), faunaUser.ref.value), {
                    data: {
                      email: stateEmail,
                    },
                  })
                )
                .then((faunaResponse) => {
                  console.log(faunaResponse);
                })
                .catch((faunaError) => console.log(faunaError));

              setEditUserInfoModalOpen(false);
              setNotificationMessage(
                'Success! Please check your email for a confirmation link.'
              );
              setNotificationType('success');
            })
            .catch((errTwo) => {
              console.log('Error: ', errTwo);
              if (errTwo.code === 'auth/requires-recent-login') {
                setPasswordModalOpen(true);
                // setFunction()
              } else {
                setEditUserInfoModalOpen(false);
                setNotificationMessage('Something went wrong.');
                setNotificationType('error');
              }
            });
        } else {
          setEditUserInfoModalOpen(false);
          setNotificationMessage('Success!');
          setNotificationType('success');
        }
      })
      .catch((err) => {
        console.log('Error: ', err);
        setEditUserInfoModalOpen(false);
        setNotificationMessage('Something went wrong.');
        setNotificationType('error');
      });
  };

  return (
    <Modal
      toggleFunction={() => setEditUserInfoModalOpen(false)}
      title='Edit Personal Info'
    >
      <Input onChange={onNameChange} value={stateName} />
      <Input onChange={onEmailChange} value={stateEmail} />
      <Spacer height={16} />
      <Button onClick={updateNameAndEmail} right medium secondary>
        {loading ? (
          <span>
            <HiddenText>Save</HiddenText>{' '}
            <Loader size={20} absolute color='#ffffff' />
          </span>
        ) : (
          'Save'
        )}
      </Button>
    </Modal>
  );
};

const HiddenText = styled.span`
  color: transparent;
  opacity: 0;
  visibility: hidden;
`;

const Input = styled.input`
  margin: 0;
  padding: 13px 13px;
  margin-bottom: 16px;
  background: #f7f7f7;
  border-radius: 5px;
  width: 100%;
  border: none;
  border: 1.5px solid transparent;
  outline: none;
  :focus {
    border: 1.5px solid rgb(25, 48, 92);
  }
`;

export default EditUserInfoModal;
