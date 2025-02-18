import { Message } from 'src/types';

import { FC, useState, useEffect, useMemo } from 'react';

import UserTextArea from './UserTextArea/UserTextArea';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Tree } from 'src/components/icons';

import s from './ChannelChat.module.scss';
import MessagesContainer from './MessagesContainer';
import PinnedMessage from './PinnedMessage';
import ChannelHeader from '../ChannelHeader';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { useAppSelector } from 'src/store/hooks';
import ScrollDiv from './ScrollDiv';
import Identity from '../Identity';
import { useTranslation } from 'react-i18next';

type Props = {
  messages: Message[];
  isPinnedMessages?: boolean;
}

const ChannelChat: FC<Props> = ({ messages }) => {
  const { t } = useTranslation();
  const { pagination } = useNetworkClient();
  const { reset } = pagination;
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const joinedChannels = useAppSelector(channels.selectors.channels);
  const currentConversation = useAppSelector(dms.selectors.currentConversation)
  const paginatedItems = useMemo(() => pagination.paginate(messages), [messages, pagination]);

  useEffect(() => {
    setReplyToMessage(undefined);
  }, [currentChannel?.id]);

  useEffect(() => {
    pagination.setCount(messages.length);
  }, [messages.length, pagination]);

  const [autoScroll, setAutoScroll] = useState(true);
  useEffect(() => {
    reset();
    setAutoScroll(true);
  }, [currentChannel?.id, reset]);

  return (
    <div className={s.root}>
      {currentChannel || currentConversation ? (
        <>
          {currentChannel && (
            <>
              <ChannelHeader {...currentChannel} />
              <PinnedMessage 
                handleReplyToMessage={setReplyToMessage}
              />
            </>
          )}
          {currentConversation && (
            <ChannelHeader
              id={currentConversation.pubkey}
              isAdmin={false}
              name={<Identity {...currentConversation} />}
              description=''
              privacyLevel={null} />
          )}
          <ScrollDiv
            canSetAutoScroll={pagination.page === 1}
            autoScrollBottom={autoScroll}
            setAutoScrollBottom={setAutoScroll}
            nearBottom={pagination.previous}
            nearTop={pagination.next}
            className={s.messagesContainer}>
            <MessagesContainer
              messages={paginatedItems}
              handleReplyToMessage={setReplyToMessage} />
          </ScrollDiv>
          <UserTextArea
            className={s.textArea}
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
          />
        </>
      ) : (
        <>
          <div className={s.channelHeader}></div>
          {joinedChannels.length === 0 && (
            <div className='flex flex-col justify-center items-center h-full'>
              <Tree></Tree>
              <div
                style={{
                  fontSize: '12px',
                  lineHeight: '14px',
                  marginTop: '14px',
                  maxWidth: '280px',
                  fontWeight: '700',
                  color: 'var(--text-primary)'
                }}
              >
                {t(`You haven't joined any channel yet. You can create or join a
                channel to start the journey!`)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChannelChat;
